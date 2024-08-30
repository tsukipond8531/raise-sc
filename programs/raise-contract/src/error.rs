use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("CampaignDurationTooLow")]
    CampaignDurationTooLow,
    #[msg("FundAmountTooLow")]
    FundAmountTooLow,
    #[msg("CampaignGoalReached")]
    CampaignGoalReached,
    #[msg("CampaignEnded")]
    CampaignEnded,
}
