use anchor_lang::prelude::*;

use crate::Platform;

#[derive(Accounts)]
pub struct SetPlatformFee<'info> {
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
pub struct SetPlatformFeeArgs {
    pub fee_to_be_changed: u64,
}

pub fn handler(ctx: Context<SetPlatformFee>, args: SetPlatformFeeArgs) -> Result<()> {
    let platform = &mut ctx.accounts.platform;

    platform.fee = args.fee_to_be_changed;

    Ok(())
}
