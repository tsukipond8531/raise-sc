pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

use constants::*;
use instructions::*;
use state::*;

declare_id!("DWeQB5bkbGG8VWQxQHjqijw5jnTyxxUe75j8W3fzAgyq");

#[program]
pub mod raise_contract {
    use super::*;

    pub fn initialize_platform(
        ctx: Context<InitializePlatform>,
        args: InitializePlatformArgs,
    ) -> Result<()> {
        instructions::initialize_platform::handler(ctx, args)
    }

    pub fn set_platform_admin(
        ctx: Context<SetPlatformAdmin>,
        args: SetPlatformAdminArgs,
    ) -> Result<()> {
        instructions::set_platform_admin::handler(ctx, args)
    }

    pub fn set_platform_fee(ctx: Context<SetPlatformFee>, args: SetPlatformFeeArgs) -> Result<()> {
        instructions::set_platform_fee::handler(ctx, args)
    }

    pub fn initialize_campaign(
        ctx: Context<InitializeCampaign>,
        args: InitializeCampaignArgs,
    ) -> Result<()> {
        instructions::initialize_campaign::handler(ctx, args)
    }

    pub fn fund_to_campaign(ctx: Context<FundToCampaign>, args: FundToCampaignArgs) -> Result<()> {
        instructions::fund_to_campaign::handler(ctx, args)
    }

    pub fn withdraw_from_campaign(ctx: Context<WithdrawFromCampaign>) -> Result<()> {
        instructions::withdraw_from_campaign::handler(ctx)
    }

    pub fn refund_to_donor(ctx: Context<RefundToDonor>) -> Result<()> {
        instructions::refund_to_donor::handler(ctx)
    }

    pub fn set_campaign_unlocked(ctx: Context<SetCampaignUnlocked>) -> Result<()> {
        instructions::set_campaign_unlocked::handler(ctx)
    }

}
