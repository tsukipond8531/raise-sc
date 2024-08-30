use anchor_lang::prelude::*;
use anchor_spl::token::Token;

use crate::{error::ErrorCode, Campaign};

#[derive(Accounts)]
pub struct WithdrawFromCampaign<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(
        seeds = [b"campaign", creator.key().as_ref()],
        bump,
        has_one = creator
        )]
    pub campaign: Account<'info, Campaign>,
    /// CHECK:
    #[account(
        seeds = [b"campaign_authority"],
        bump = campaign.campaign_authority_bump,
        )]
    pub campaign_authority: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<WithdrawFromCampaign>) -> Result<()> {
    let campaign = &mut ctx.accounts.campaign;
    let current_timestamp = Clock::get().unwrap().unix_timestamp;
    
    require!(campaign.is_withdrawn == false, ErrorCode::CampaignFundAlreadyWithdrawn);
    require!(campaign.raised_amount >= campaign.goal, ErrorCode::CampaignGoalNotReached);
    require!(campaign.ending_timestamp >= current_timestamp, ErrorCode::CampaignFundDurationNotEnded);

    // transfer fund from campaign to creator
    campaign.transfer_tokens(
        campaign.to_account_info(),
        ctx.accounts.creator.to_account_info(),
        ctx.accounts.campaign_authority.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        campaign.raised_amount
    )?;

    campaign.is_withdrawn = true;
    campaign.raised_amount = 0;

    Ok(())
}