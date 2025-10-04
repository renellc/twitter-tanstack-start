import { Tabs as TabsPrimitive } from "radix-ui";
import {
	type ComponentProps,
	createContext,
	useCallback,
	useContext,
	useState,
} from "react";

interface TabsContextProps {
	activeTab?: string;
}

const TabsContext = createContext<TabsContextProps>({});

const useTabs = () => useContext(TabsContext);

export interface TabsProps extends ComponentProps<typeof TabsPrimitive.Root> {}

export const Tabs = ({ className, onValueChange, ...props }: TabsProps) => {
	const [activeTab, setActiveTab] = useState(props.defaultValue);

	const onValueChangeInner = useCallback(
		(value: string) => {
			setActiveTab(value);

			onValueChange?.(value);
		},
		[onValueChange],
	);

	return (
		<TabsContext.Provider value={{ activeTab }}>
			<TabsPrimitive.Root
				className={className}
				onValueChange={onValueChangeInner}
				{...props}
			/>
		</TabsContext.Provider>
	);
};

export interface TabsTriggerProps
	extends ComponentProps<typeof TabsPrimitive.Trigger> {}

export const TabsTrigger = ({
	className,
	children,
	...props
}: TabsTriggerProps) => {
	const { activeTab } = useTabs();

	return (
		<TabsPrimitive.Trigger
			className="relative p-4 hover:cursor-pointer hover:bg-[#2B3640]"
			{...props}
		>
			{children}

			{activeTab === props.value && (
				<div className="absolute bg-[#1D9BF1] h-1 w-2/3 rounded mt-auto bottom-0" />
			)}
		</TabsPrimitive.Trigger>
	);
};

export const TabsList = TabsPrimitive.List;

export const TabsContent = TabsPrimitive.Content;
