import { useState, useEffect } from 'react';
import { getMyVendorApplication, type VendorApplication } from '@/lib/vendorApplications';
import { type MarketplaceItem } from '@/data/marketplace';

export function useVendorVerifiedStatus(item?: MarketplaceItem) {
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkVendorStatus = async () => {
      if (!item?.vendorBrand) {
        setIsVerified(false);
        setLoading(false);
        return;
      }

      try {
        const { data: application } = await getMyVendorApplication();
        
        // Check if user has an approved application that matches this item's vendorBrand
        const isVendorApproved = Boolean(
          application && 
          application.status === 'approved' && 
          application.brand_name === item.vendorBrand
        );

        setIsVerified(isVendorApproved);
      } catch (err) {
        console.error('Error checking vendor status:', err);
        setIsVerified(false);
      } finally {
        setLoading(false);
      }
    };

    checkVendorStatus();
  }, [item]);

  return { isVerified, loading };
}
