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

    pub fn initialize_platform(ctx: Context<Initialize>) -> Result<()> {
        initialize_platform::handler(ctx)
    }
}
