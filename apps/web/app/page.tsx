"use client";

import { ColorSchemeToggle } from "@repo/ui/components/color-scheme-toggle";
import HomeScreen from "./components/Home/HomeScreen";

export default function HomePage() {
	return (
		<>
			<HomeScreen />
			<ColorSchemeToggle />
		</>
	);
}
