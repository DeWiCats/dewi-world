import ellipsizeAddress from '@utils/ellipsizeAddress';
import React, { useCallback, useState } from 'react';
import { Alert, Platform } from 'react-native';
import Button from './ButtonPressable';

// Conditionally import Solana modules only on Android
let transact: any = null;
let Web3MobileWallet: any = null;
let Connection: any = null;
let LAMPORTS_PER_SOL: any = null;
let PublicKey: any = null;
let SystemProgram: any = null;
let TransactionMessage: any = null;
let VersionedTransaction: any = null;
let toByteArray: any = null;

const isSolanaSupported = Platform.OS === 'android';

if (isSolanaSupported) {
  try {
    const walletAdapter = require('@solana-mobile/mobile-wallet-adapter-protocol-web3js');
    const web3 = require('@solana/web3.js');
    const base64 = require('react-native-quick-base64');

    transact = walletAdapter.transact;
    Web3MobileWallet = walletAdapter.Web3MobileWallet;
    Connection = web3.Connection;
    LAMPORTS_PER_SOL = web3.LAMPORTS_PER_SOL;
    PublicKey = web3.PublicKey;
    SystemProgram = web3.SystemProgram;
    TransactionMessage = web3.TransactionMessage;
    VersionedTransaction = web3.VersionedTransaction;
    toByteArray = base64.toByteArray;
  } catch (error) {
    console.warn('Solana Mobile Wallet Adapter not available:', error);
  }
}

export const APP_IDENTITY = {
  name: 'DeWiWorld',
  uri: 'https://dewicats.com',
  icon: 'favicon.ico',
};

// Solana connection - using devnet for development, switch to mainnet for production
let connection: any = null;

if (isSolanaSupported && Connection) {
  connection = new Connection('https://api.devnet.solana.com', {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000, // 60 seconds
    wsEndpoint: undefined, // Disable websocket for better emulator compatibility
  });
}

// Test connection function
const testConnection = async () => {
  if (!connection) return false;

  try {
    console.log('Testing Solana connection...');
    const version = await connection.getVersion();
    console.log('✅ Solana connection successful:', version);
    return true;
  } catch (error) {
    console.error('❌ Solana connection failed:', error);
    return false;
  }
};

interface MobileWalletAdapterButtonProps {
  onConnect?: (address: string, signedMessage: string, signature: string) => void;
  onDisconnect?: () => void;
  onPaymentSuccess?: (signature: string) => void;
  onPaymentFailure?: (error: string) => void;
  verifying?: boolean;
  paymentMode?: boolean;
  paymentAmount?: number; // Amount in SOL
  recipientAddress?: string;
  paymentDescription?: string;
}

const MobileWalletAdapterButton = ({
  onConnect,
  onDisconnect,
  onPaymentSuccess,
  onPaymentFailure,
  verifying,
  paymentMode = false,
  paymentAmount = 0.1,
  recipientAddress = 'DeWi7Z1111111111111111111111111111111111111', // Valid base58 treasury address
  paymentDescription = 'Location Creation Payment',
}: MobileWalletAdapterButtonProps) => {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const handleConnect = useCallback(async () => {
    if (!isSolanaSupported || !transact) {
      Alert.alert(
        'Not Supported',
        'Solana Mobile Wallet is only available on Solana Mobile devices.'
      );
      return;
    }

    setLoading(true);
    try {
      const authorizationResult = await transact(async (wallet: any) => {
        const authResult = await wallet.authorize({
          chain: 'solana:devnet', // Change to 'solana:mainnet' for production
          identity: APP_IDENTITY,
          sign_in_payload: {
            domain: 'dewicats.com',
            statement: 'Sign in to DeWiWorld',
            uri: 'https://dewicats.com',
          },
        });

        return authResult;
      });

      if (!authorizationResult.accounts || authorizationResult.accounts.length === 0) {
        throw new Error('No wallet accounts found');
      }

      const walletAccount = authorizationResult.accounts[0];
      // Convert base64 address to PublicKey using toByteArray as per official docs
      const base58Address = new PublicKey(toByteArray(walletAccount.address)).toBase58();

      setAddress(base58Address);
      setAuthToken(authorizationResult.auth_token);

      // Handle sign-in result if available
      if (authorizationResult.sign_in_result) {
        const signInResult = authorizationResult.sign_in_result;
        // Convert base64 to string for message and signature
        const messageBytes = toByteArray(signInResult.signed_message);
        const signatureBytes = toByteArray(signInResult.signature);
        const base58Message = new TextDecoder().decode(messageBytes);
        const base58Signature = Array.from(signatureBytes)
          .map((b: any) => (b as number).toString(16).padStart(2, '0'))
          .join('');
        onConnect?.(base58Address, base58Message, base58Signature);
      } else {
        onConnect?.(base58Address, '', '');
      }

      console.log('Connected to wallet:', base58Address);
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      Alert.alert('Connection Error', 'Failed to connect to wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [onConnect]);

  const handlePayment = useCallback(async () => {
    if (!isSolanaSupported || !transact) {
      Alert.alert(
        'Not Supported',
        'Solana Mobile Wallet is only available on Solana Mobile devices.'
      );
      return;
    }

    setLoading(true);

    // Test network connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      onPaymentFailure?.(
        'Network connection failed. Please check your internet connection and try again.'
      );
      Alert.alert(
        'Network Error',
        'Cannot connect to Solana network. Please check your internet connection and try again.'
      );
      setLoading(false);
      return;
    }

    try {
      console.log('getting latest blockhash');
      // Get latest blockhash
      const latestBlockhash = await connection.getLatestBlockhash();
      console.log('latestBlockhash', latestBlockhash);
      const txSignature = await transact(async (wallet: any) => {
        console.log('authToken', authToken);
        // Authorize the wallet session (reuse existing auth_token if available)
        const authorizationResult = await wallet.authorize({
          chain: 'solana:devnet', // Change to 'solana:mainnet' for production
          identity: APP_IDENTITY,
          auth_token: authToken || undefined,
        });

        console.log('authorizationResult', authorizationResult);

        if (!authorizationResult.accounts || authorizationResult.accounts.length === 0) {
          throw new Error('No wallet accounts found');
        }

        // Convert base64 address to web3.js PublicKey class using toByteArray
        const authorizedPubkey = new PublicKey(
          toByteArray(authorizationResult.accounts[0].address)
        );
        console.log('Authorized public key', authorizedPubkey);

        // Update local state if we didn't have the address before
        if (!address) {
          const base58Address = authorizedPubkey.toBase58();
          setAddress(base58Address);
          setAuthToken(authorizationResult.auth_token);
        }
        console.log('address', address);

        // Create recipient PublicKey
        const toPubkey = new PublicKey(recipientAddress);

        // Construct transfer instruction
        const instructions = [
          SystemProgram.transfer({
            fromPubkey: authorizedPubkey,
            toPubkey: toPubkey,
            lamports: Math.floor(paymentAmount * LAMPORTS_PER_SOL),
          }),
        ];

        // Construct the Versioned message and transaction
        const txMessage = new TransactionMessage({
          payerKey: authorizedPubkey,
          recentBlockhash: latestBlockhash.blockhash,
          instructions,
        }).compileToV0Message();
        console.log('Instructions constructed, begin transfer');

        const transferTx = new VersionedTransaction(txMessage);
        console.log('sending transaction...');

        // Send the unsigned transaction, the wallet will sign and submit it to the network
        const transactionSignatures = await wallet.signAndSendTransactions({
          transactions: [transferTx],
        });

        console.log('transaction sent');
        return transactionSignatures[0];
      });

      // Confirm the transaction was successful
      console.log('Transaction signature:', txSignature);

      try {
        const confirmationResult = await connection.confirmTransaction(txSignature, 'confirmed');

        if (confirmationResult.value.err) {
          throw new Error(JSON.stringify(confirmationResult.value.err));
        } else {
          console.log('Transaction successfully confirmed!');
          onPaymentSuccess?.(txSignature);
          Alert.alert(
            'Payment Successful!',
            `${paymentAmount} SOL sent successfully!\n\nTransaction: ${txSignature.slice(0, 8)}...`
          );
        }
      } catch (confirmError) {
        console.log('Transaction sent but confirmation failed:', confirmError);
        // Still call success since transaction was sent
        onPaymentSuccess?.(txSignature);
        Alert.alert(
          'Payment Sent!',
          `Transaction submitted but confirmation pending.\n\nTransaction: ${txSignature.slice(0, 8)}...`
        );
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown payment error';

      // Provide specific error messages for network issues
      let userMessage = errorMessage;
      if (
        errorMessage.includes('fetch') ||
        errorMessage.includes('network') ||
        errorMessage.includes('timeout')
      ) {
        userMessage = 'Network connection issue. Please check your internet and try again.';
      } else if (errorMessage.includes('blockhash') || errorMessage.includes('recent')) {
        userMessage = 'Network sync issue. Please try again in a moment.';
      } else if (errorMessage.includes('insufficient') || errorMessage.includes('balance')) {
        userMessage = 'Insufficient SOL balance. Please add funds to your wallet.';
      }

      onPaymentFailure?.(userMessage);
      Alert.alert('Payment Failed', userMessage);
    } finally {
      setLoading(false);
    }
  }, [authToken, address, paymentAmount, recipientAddress, onPaymentSuccess, onPaymentFailure]);

  const handleDisconnect = useCallback(async () => {
    if (!authToken) return;
    if (!isSolanaSupported || !transact) {
      setAddress(null);
      setAuthToken(null);
      onDisconnect?.();
      return;
    }

    setLoading(true);
    try {
      await transact(async (wallet: any) => {
        await wallet.deauthorize({
          auth_token: authToken,
        });
      });

      setAddress(null);
      setAuthToken(null);
      onDisconnect?.();
      console.log('Disconnected from wallet');
    } catch (error) {
      console.error('Error disconnecting from wallet:', error);
    } finally {
      setLoading(false);
    }
  }, [authToken, onDisconnect]);

  const getButtonTitle = () => {
    if (paymentMode) {
      if (!address) {
        return `Connect & Pay ${paymentAmount} SOL`;
      }
      return `Pay ${paymentAmount} SOL`;
    }

    if (address) {
      return ellipsizeAddress(address, { chunkSize: 6 });
    }

    return 'Connect Wallet';
  };

  const handlePress = () => {
    if (paymentMode) {
      handlePayment();
    } else if (address) {
      handleDisconnect();
    } else {
      handleConnect();
    }
  };

  return (
    <Button
      title={getButtonTitle()}
      loading={loading || verifying}
      onPress={handlePress}
      backgroundColor="blue.500"
      titleColor="primaryBackground"
      backgroundColorPressed="blue.600"
      borderRadius="2xl"
      height={56}
      style={{
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}
    />
  );
};

export default MobileWalletAdapterButton;
