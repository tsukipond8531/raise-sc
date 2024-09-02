use anchor_lang::prelude::*;
use anchor_spl::token::Token;

use crate::{error::ErrorCode, Campaign, Donor};

#[derive(Accounts)]
pub struct FundToCampaign<'info> {
    #[account(mut)]
    pub donor: Signer<'info>,
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
        init_if_needed,
        seeds = [b"donor", campaign.key().as_ref(), donor.key().as_ref()],
        bump,
        payer = donor,
        space = Donor::LEN,
        )]
    pub donor_info: Account<'info, Donor>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct FundToCampaignArgs {
    pub fund_amount: u64, // in lamports
}

pub fn handler(ctx: Context<FundToCampaign>, args: FundToCampaignArgs) -> Result<()> {
    let campaign = &mut ctx.accounts.campaign;
    let donor_info = &mut ctx.accounts.donor_info;
    let current_timestamp = Clock::get().unwrap().unix_timestamp;
    
    require!(args.fund_amount > campaign.minimum_deposit_amount, ErrorCode::FundAmountTooLow);
    require!(campaign.goal < campaign.raised_amount, ErrorCode::CampaignGoalReached);
    require!(campaign.ending_timestamp > current_timestamp, ErrorCode::CampaignEnded);

    campaign.transfer_tokens_from_user(
        ctx.accounts.donor.to_account_info(),
        campaign.to_account_info(),
        ctx.accounts.campaign_authority.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        args.fund_amount,
    )?;

    donor_info.donor_bump = ctx.bumps.donor_info;
    donor_info.donor = ctx.accounts.donor.key();
    donor_info.campaign = campaign.key();
    donor_info.amount += args.fund_amount;

    campaign.raised_amount += args.fund_amount;
    
    Ok(())
}