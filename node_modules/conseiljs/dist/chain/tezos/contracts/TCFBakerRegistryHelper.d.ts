export declare namespace TCFBakerRegistryHelper {
    function verifyDestination(server: string, address: string): Promise<boolean>;
    function getSimpleStorage(server: string, address: string): Promise<{
        mapid: number;
        owner: any;
        signupFee: number;
        updateFee: number;
    }>;
    function updateRegistration(server: string, address: string, baker: string, name: string, isAcceptingDelegation: boolean, detailsURL: string, payoutShare: number): Promise<void>;
    function queryRegistration(server: string, mapid: number, baker: string): Promise<{
        name: string;
        isAcceptingDelegation: boolean;
        externalDataURL: string;
        split: number;
        paymentAccounts: any;
        minimumDelegation: number;
        isGreedy: boolean;
        payoutDelay: number;
        payoutFrequency: number;
        minimumPayout: number;
        isCheap: boolean;
        paymentConfig: {
            payForOwnBlocks: boolean;
            payForEndorsements: boolean;
            payGainedFees: boolean;
            payForAccusationGains: boolean;
            subtractLostDepositsWhenAccused: boolean;
            subtractLostRewardsWhenAccused: boolean;
            subtractLostFeesWhenAccused: boolean;
            payForRevelation: boolean;
            subtractLostRewardsWhenMissRevelation: boolean;
            subtractLostFeesWhenMissRevelation: boolean;
            compensateMissedBlocks: boolean;
            payForStolenBlocks: boolean;
            compensateMissedEndorsements: boolean;
            compensateLowPriorityEndorsementLoss: boolean;
        };
        overdelegationThreshold: number;
        subtractRewardsFromUninvitedDelegation: boolean;
        recordManager: any;
        timestamp: Date;
    } | undefined>;
}
