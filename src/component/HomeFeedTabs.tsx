import { Tabs } from "radix-ui";
import {
	type ComponentProps,
	createContext,
	useCallback,
	useContext,
	useState,
} from "react";

interface HomeFeedTabsContextProps {
	activeTab?: string;
}

const HomeFeedTabsContext = createContext<HomeFeedTabsContextProps>({});

const useHomeFeedTabs = () => useContext(HomeFeedTabsContext);

export interface HomeFeedTabsProps extends ComponentProps<typeof Tabs.Root> {}

export const HomeFeedTabs = ({
	className,
	onValueChange,
	...props
}: HomeFeedTabsProps) => {
	const [activeTab, setActiveTab] = useState(props.defaultValue);

	const onValueChangeInner = useCallback(
		(value: string) => {
			setActiveTab(value);

			onValueChange?.(value);
		},
		[onValueChange],
	);

	return (
		<HomeFeedTabsContext.Provider value={{ activeTab }}>
			<Tabs.Root
				className={className}
				onValueChange={onValueChangeInner}
				{...props}
			/>
		</HomeFeedTabsContext.Provider>
	);
};

export interface HomeFeedTabsTriggerProps
	extends ComponentProps<typeof Tabs.Trigger> {}

export const HomeFeedTabsTrigger = ({
	className,
	children,
	...props
}: HomeFeedTabsTriggerProps) => {
	const { activeTab } = useHomeFeedTabs();

	return (
		<Tabs.Trigger
			className="relative p-4 hover:cursor-pointer hover:bg-[#2B3640]"
			{...props}
		>
			{children}

			{activeTab === props.value && (
				<div className="absolute bg-[#1D9BF1] h-1 w-2/3 rounded mt-auto bottom-0" />
			)}
		</Tabs.Trigger>
	);
};

export const HomeFeedTabsList = Tabs.List;

export const HomeFeedTabsContent = Tabs.Content;
