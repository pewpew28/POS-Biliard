import ExistingCashierPage from '@/pages/cashier/billiard-sessions/index';

export default function PosIndex(props: Parameters<typeof ExistingCashierPage>[0]) {
    return <ExistingCashierPage {...props} isPos />;
}
