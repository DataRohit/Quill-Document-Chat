import { redirect } from 'next/navigation';

import Dashboard from '@/components/Dashboard';
import { db } from '@/db';
import { getUserSubscriptionPlan } from '@/lib/strip';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

const Page = async () => {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	const subscriptionPlan = await getUserSubscriptionPlan();

	if (!user || !user.id) redirect("/auth-callback?origin=dashboard");

	const dbUser = await db.user.findFirst({
		where: {
			id: user.id,
		},
	});

	if (!dbUser) redirect("/auth-callback?origin=dashboard");

	return <Dashboard subscriptionPlan={subscriptionPlan} />;
};

export default Page;
