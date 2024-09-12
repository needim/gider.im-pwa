import type React from "react";
import { type ReactNode, createContext, useState } from "react";

export interface Noty {
	id: number;
	message: string;
	type: "success" | "error" | "info";
	duration?: number;
}

export interface NotyContextType {
	notifications: Noty[];
	show: (
		message: string,
		type: "success" | "error" | "info",
		duration?: number,
	) => void;
	remove: (id: number) => void;
}

export const NotyContext = createContext<NotyContextType | undefined>(
	undefined,
);

export const NotyProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [notifications, setNotifications] = useState<Noty[]>([]);

	const show = (
		message: string,
		type: "success" | "error" | "info",
		duration = 3000,
	) => {
		const id = new Date().getTime();
		setNotifications([{ id, message, type, duration }]);
		setTimeout(() => remove(id), duration);
	};

	const remove = (id: number) => {
		setNotifications((notifications) =>
			notifications.filter((notification) => notification.id !== id),
		);
	};

	return (
		<NotyContext.Provider value={{ notifications, show, remove }}>
			{children}
		</NotyContext.Provider>
	);
};
