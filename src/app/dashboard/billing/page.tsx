import BillingForm from '@/components/BillingForm';
import { getUserSubscriptionPlan } from '@/lib/strip';

const Billing = async () => {
	const subscriptionPlan = await getUserSubscriptionPlan();

	return <BillingForm subscriptionPlan={subscriptionPlan} />;
};

export default Billing;
