import { Outlet } from "@tanstack/react-router";

export const AppLayout = () => {
	return (
		<div className="grid grid-cols-3 w-dvw h-dvh gap-6">
			<div className="justify-self-end">
				{/* add left hand content here (navbar) */}
			</div>

			<div className="border border-l-[#39444D] border-r-[#39444D] border-t-0 border-b-0">
				<Outlet />
			</div>

			<div className="justify-self-start">
				{/* add right hand content here */}
			</div>
		</div>
	);
};
