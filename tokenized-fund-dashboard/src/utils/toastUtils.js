import { toast } from 'react-hot-toast';

export const showMintToast = (amount, nav) => {
  toast.success(`Minted $${amount.toFixed(2)} at NAV $${nav.toFixed(2)}`);
};

export const showRedeemToast = (amount, nav) => {
  toast.success(`Redeemed $${amount.toFixed(2)} at NAV $${nav.toFixed(2)}`);
};

export const showWithdrawToast = (amount) => {
  toast.success(`Withdrawn $${amount.toFixed(2)} in yield`);
}; 