import { useEffect } from 'react'
import { hdkey } from '@ethereumjs/wallet';
import { Keyring } from '@polkadot/keyring';
import { u8aToHex } from '@polkadot/util';
import { cryptoWaitReady, mnemonicToMiniSecret } from '@polkadot/util-crypto';
import * as bip39 from '@scure/bip39';
import { wordlist as english } from '@scure/bip39/wordlists/english';


function App() {
  useEffect(() => {
    (async () => {
      await cryptoWaitReady();
        
      let addressData = {
        evm: {},
        substrate: {}
      };
      const mnemonic = bip39.generateMnemonic(english);

      const seed = bip39.mnemonicToSeedSync(mnemonic);
      const hdWallet = hdkey.EthereumHDKey.fromMasterSeed(seed);
      const wallet = hdWallet.derivePath("m/44'/60'/0'/0/0").getWallet();

      const ethAddress = wallet.getAddressString();
      const ethPrivateKey = wallet.getPrivateKeyString();

      addressData.evm = {
        address: ethAddress,
        public: '',
        private: ethPrivateKey,
        index: 0,
      }

      const keyring = new Keyring({ type: 'sr25519', ss58Format: 42 });
      const polkadotAccount = keyring.createFromUri(mnemonic, { name: 'sr25519' });
      const polkadotPrivateKey = u8aToHex(mnemonicToMiniSecret(mnemonic));


      addressData.substrate = {
        address: polkadotAccount.address,
        public: Array.from(polkadotAccount.publicKey),
        private: polkadotPrivateKey,
      }

      window?.ReactNativeWebView?.postMessage(JSON.stringify({addresses: addressData, mnemonic: mnemonic}));
    })()  
  }, []);

  return null
}

export default App
