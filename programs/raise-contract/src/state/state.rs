use anchor_lang::prelude::*;
use anchor_spl::token::Transfer;

#[account]
pub struct Platform {
    pub admin: Pubkey,
    pub fee: u64,
    pub fee_accumulated: u64,

    pub authority: Pubkey,
    pub authority_bump: u8,
}

impl Platform {
    pub const LEN: usize = std::mem::size_of::<Platform>() + 8;
}

#[account]
pub struct Campaign {
    pub creator: Pubkey,
    pub goal: u64,
    pub ending_timestamp: i64,
    pub minimum_deposit_amount: u64,
    pub raised_amount: u64,
    pub is_withdrawn: bool,
    pub is_locked: bool,

    pub campaign_authority: Pubkey,
    pub campaign_authority_bump: u8,
}

impl Campaign {
    pub const LEN: usize = std::mem::size_of::<Campaign>() + 8;

    pub fn transfer_tokens<'info>(
        &self,
        from: AccountInfo<'info>,
        to: AccountInfo<'info>,
        authority: AccountInfo<'info>,
        token_program: AccountInfo<'info>,
        amount: u64,
    ) -> Result<()> {
        let authority_seeds: &[&[&[u8]]] =
            &[&[b"platform_authority", &[self.campaign_authority_bump]]];

        let context = CpiContext::new(
            token_program,
            Transfer {
                from,
                to,
                authority,
            },
        )
        .with_signer(authority_seeds);

        anchor_spl::token::transfer(context, amount)
    }

    pub fn transfer_tokens_from_user<'info>(
        &self,
        from: AccountInfo<'info>,
        to: AccountInfo<'info>,
        authority: AccountInfo<'info>,
        token_program: AccountInfo<'info>,
        amount: u64,
    ) -> Result<()> {
        let context = CpiContext::new(
            token_program,
            Transfer {
                from,
                to,
                authority,
            },
        );
        anchor_spl::token::transfer(context, amount)
    }
}

#[account]
pub struct Donor {
    pub donor: Pubkey,
    pub campaign: Pubkey,
    pub amount: u64,

    pub donor_bump: u8,
}

impl Donor {
    pub const LEN: usize = std::mem::size_of::<Donor>() + 8;
}
