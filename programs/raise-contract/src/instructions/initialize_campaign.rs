use anchor_lang::prelude::*;

use crate::{Campaign, MIN_CAMPAIGN_DURATION, error::ErrorCode};

#[derive(Accounts)]
pub struct InitializeCampaign<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(
        init,
        seeds = [b"campaign", creator.key().as_ref()],
        bump,
        payer = creator,
        space = Campaign::LEN
        )]
    pub campaign: Account<'info, Campaign>,
    /// CHECK:
    #[account(
        seeds = [b"campaign_authority"],
        bump
        )]
    pub campaign_authority: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitializeCampaignArgs {
    pub goal: u64,
    pub campaign_duration: i64, // in seconds
    pub min_deposit_amount: u64, // in lamport
}

pub fn handler(ctx: Context<InitializeCampaign>, args: InitializeCampaignArgs) -> Result<()> {
    let campaign = &mut ctx.accounts.campaign;
    
    require!(args.campaign_duration > MIN_CAMPAIGN_DURATION, ErrorCode::CampaignDurationTooLow);

    campaign.creator = ctx.accounts.creator.key();
    campaign.goal = args.goal;
    campaign.ending_timestamp = Clock::get()?.unix_timestamp + args.campaign_duration;
    campaign.minimum_deposit_amount = args.min_deposit_amount;
    campaign.is_locked = true;
    campaign.is_withdrawn = false;

    campaign.bump = ctx.bumps.campaign;
    campaign.campaign_authority = ctx.accounts.campaign_authority.key();
    campaign.campaign_authority_bump = ctx.bumps.campaign_authority;

    Ok(())
}