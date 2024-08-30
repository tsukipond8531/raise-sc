use anchor_lang::prelude::*;

use crate::{Campaign, error::ErrorCode};

#[derive(Accounts)]
pub struct SetCampaignUnlocked<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(
        seeds = [b"campaign", creator.key().as_ref()],
        bump,
        has_one = creator
        )]
    pub campaign: Account<'info, Campaign>,

    pub system_program: Program<'info, System>,
}

// unlock campaign so that donors can refund their funds
pub fn handler(ctx: Context<SetCampaignUnlocked>) -> Result<()> {
    let campaign = &mut ctx.accounts.campaign;
    
    require!(campaign.is_locked == true, ErrorCode::CampaignIsOnProgress);

    campaign.is_locked = false;

    Ok(())
}