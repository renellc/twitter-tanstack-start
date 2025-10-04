import { createFileRoute } from "@tanstack/react-router";
import {
	HomeFeedTabs,
	HomeFeedTabsContent,
	HomeFeedTabsList,
	HomeFeedTabsTrigger,
} from "../component/HomeFeedTabs";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex flex-col">
			<HomeFeedTabs defaultValue="for-you">
				<HomeFeedTabsList className="border border-b-[#39444D] border-t-0 border-x-0">
					<HomeFeedTabsTrigger value="for-you">
						<span>For You</span>
					</HomeFeedTabsTrigger>

					<HomeFeedTabsTrigger value="following">
						<span>Following</span>
					</HomeFeedTabsTrigger>
				</HomeFeedTabsList>

				<HomeFeedTabsContent value="for-you">For You Feed</HomeFeedTabsContent>

				<HomeFeedTabsContent value="following">
					Following Feed
				</HomeFeedTabsContent>
			</HomeFeedTabs>
		</div>
	);
}
