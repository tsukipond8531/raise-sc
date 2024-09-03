use anchor_lang::prelude::*;
use anchor_spl::token::Token;

use crate::{error::ErrorCode, Campaign, Donor};

#[derive(Accounts)]
pub struct RefundToDonor<'info> {
    /// CHECK
    #[account(mut)]
    pub donor: AccountInfo<'info>,
    /// CHECK:
    #[account(mut)]
    pub creator: AccountInfo<'info>,
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

    #[account(
        seeds = [b"donor", campaign.key().as_ref(), donor.key().as_ref()],
        bump = donor_info.donor_bump,
        )]
    pub donor_info: Account<'info, Donor>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<RefundToDonor>) -> Result<()> {
    let campaign = &mut ctx.accounts.campaign;
    let donor_info = &mut ctx.accounts.donor_info;
    
    require!(campaign.is_locked == false, ErrorCode::CampaignIsOnProgress);

    let refund_amount = donor_info.amount;

    // transfer fund from campaign to donor
    campaign.transfer_tokens(
        campaign.to_account_info(),
        ctx.accounts.donor.to_account_info(),
        ctx.accounts.campaign_authority.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        refund_amount
    )?;

    donor_info.amount = 0;

    campaign.raised_amount -= refund_amount;
    
    Ok(())
}