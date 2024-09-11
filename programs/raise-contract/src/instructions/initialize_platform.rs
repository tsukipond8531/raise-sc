use anchor_lang::prelude::*;

use crate::Platform;

#[derive(Accounts)]
pub struct InitializePlatform<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init,
        seeds = [b"platform"],
        bump,
        payer = admin,
        space = Platform::LEN
        )]
    pub platform: Account<'info, Platform>,
    /// CHECK:
    #[account(
        seeds = [b"platform_authority"],
        bump
        )]
    pub platform_authority: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitializePlatformArgs {
    pub fee: u64,
}

pub fn handler(ctx: Context<InitializePlatform>, args: InitializePlatformArgs) -> Result<()> {
    let platform = &mut ctx.accounts.platform;

    platform.bump = ctx.bumps.platform;
    platform.admin = ctx.accounts.admin.key();
    platform.fee = args.fee;
    platform.fee_accumulated = 0;
    platform.authority = ctx.accounts.platform_authority.key();
    platform.authority_bump = ctx.bumps.platform_authority;

    Ok(())
}
