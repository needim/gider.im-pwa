import { Tag } from "@/components/custom/tag";
import type { TagColor } from "@/components/custom/tag-color-picker";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem } from "@/components/ui/select";
import type { TTagId } from "@/evolu-db";
import { useTags } from "@/contexts/data";
import { useLocalization } from "@/hooks/use-localization";
import { SelectTrigger } from "@radix-ui/react-select";
import { IconTag } from "@tabler/icons-react";

export function TagSelect({
	value,
	onValueChange,
}: {
	value: string | undefined;
	onValueChange: (value: TTagId) => void;
}) {
        const tags = useTags();
        const { m } = useLocalization();
        const selectedTag = tags.find((t) => t.id === value);

	return (
		<Select onValueChange={onValueChange} value={value || "no-tag"}>
			<SelectTrigger asChild>
				<Button
					variant="outline"
					className="justify-start shrink-0 rounded"
					disableScale
				>
					<IconTag className="-left-1.5 relative text-muted-foreground size-5 shrink-0" />
					<span className="truncate max-w-24">
						{selectedTag ? (
							<Tag
								className="ml-0"
								name={selectedTag.name}
								allowColorChange={false}
								displayColor={false}
								color={selectedTag.color as TagColor}
							/>
						) : (
							<span className="text-muted-foreground">{m.Tag()}</span>
						)}
					</span>
				</Button>
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="no-tag">{m.Tag()}</SelectItem>
                                {tags.map((tag) => (
					<SelectItem key={tag.id} value={tag.id}>
						<Tag
							className="ml-0"
							name={tag.name}
							color={tag.color as TagColor}
						/>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
