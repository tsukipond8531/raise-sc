use anchor_lang::prelude::*;

#[constant]
pub const SEED: &str = "anchor";

pub const MIN_CAMPAIGN_DURATION: i64 = 60 * 60 * 24 * 10; // 10 days
