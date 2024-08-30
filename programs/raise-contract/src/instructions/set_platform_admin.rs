use anchor_lang::prelude::*;

use crate::Platform;

#[derive(Accounts)]
pub struct SetPlatformAdmin<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        seeds = [b"platform"],
        bump,
        has_one = admin
        )]
    pub platform: Account<'info, Platform>,

    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct SetPlatformAdminArgs {
    pub admin_to_be_changed: Pubkey,
}

pub fn handler(ctx: Context<SetPlatformAdmin>, args: SetPlatformAdminArgs) -> Result<()> {
    let platform = &mut ctx.accounts.platform;

    platform.admin = args.admin_to_be_changed;

    Ok(())
}
