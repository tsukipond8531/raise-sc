pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("DWeQB5bkbGG8VWQxQHjqijw5jnTyxxUe75j8W3fzAgyq");

#[program]
pub mod raise_contract {
    use super::*;

    pub fn initialize_platform(
        ctx: Context<InitializePlatform>,
        args: InitializePlatformArgs,
    ) -> Result<()> {
        initialize_platform::handler(ctx, args)
    }

    pub fn set_platform_admin(
        ctx: Context<SetPlatformAdmin>,
        args: SetPlatformAdminArgs,
    ) -> Result<()> {
        set_platform_admin::handler(ctx, args)
    }

    pub fn initialize_campaign(
        ctx: Context<InitializeCampaign>,
        args: InitializeCampaignArgs,
    ) -> Result<()> {
        initialize_campaign::handler(ctx, args)
    }

    pub fn set_platform_fee(ctx: Context<SetPlatformFee>, args: SetPlatformFeeArgs) -> Result<()> {
        set_platform_fee::handler(ctx, args)
    }
}
