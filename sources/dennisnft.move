module dennisnft:: dennisnft {   //defines a new module named nft

    use sui::url::{Self, Url}; 
    use std::string::{Self, String};
    use sui::event; 
    use sui::display;
    use sui::package;

    public struct DENNISNFT has drop {}


   
    public struct DennisNFT has key, store {

        id: UID,
        name: string::String, 
        description: string::String, 
       
        url: Url, 
    }

   
    public struct NFTMinted has copy, drop {
  
        object_id: ID,
       
        creator: address,
       
        name: string::String,
    }

    fun init( witness: DENNISNFT,ctx: &mut TxContext) {
         let publisher = package::claim(witness, ctx);

        let keys = vector[
            string::utf8(b"name"),
            string::utf8(b"description"),
            string::utf8(b"image_url"),
            string::utf8(b"creator")
        ];

        let values = vector[
           string::utf8(b"{name}"),
            string::utf8(b"{description}"),
            string::utf8(b"{url}"),
            string::utf8(b"{creator}")
        ];

        let mut display = display::new_with_fields<DennisNFT>(
            &publisher, 
            keys,
            values,
            ctx
        );

        display::update_version(&mut display);

        transfer::public_transfer(publisher, tx_context::sender(ctx));
        transfer::public_transfer(display, tx_context::sender(ctx));
    }



    
    public entry fun mint(
        name: vector<u8>,
        description: vector<u8>,
        url: vector<u8>,
        ctx: &mut TxContext
        
    ) {
        let nft = DennisNFT {
            id: object::new(ctx),
            name: string::utf8(name),
            description: string::utf8(description),
            url: url::new_unsafe_from_bytes(url)
        };
        let sender = tx_context::sender(ctx);
        event::emit(NFTMinted {
            object_id: object::uid_to_inner(&nft.id),
            creator: sender,
            name: nft.name,
        });
        transfer::public_transfer(nft, sender);
    }

   
    public entry fun update_description(
        nft: &mut DennisNFT,
        new_description: vector<u8>,
    ) {
        nft.description = string::utf8(new_description)
    }

   
  public entry fun burn_nft<T: key + store>(nft: T) {
    
    sui::transfer::public_transfer(nft, @0x0);
}

   
    public fun name(nft: &DennisNFT): &string::String {
        &nft.name
    }

   
    public fun description(nft: &DennisNFT): &string::String {
        &nft.description
    }

   
    public fun url(nft: &DennisNFT): &Url {
        &nft.url
    }
}