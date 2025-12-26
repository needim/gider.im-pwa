import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useLocalization } from "@/hooks/use-localization";
import { IconAlertTriangleFilled } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export const DeprecationDrawer = () => {
  const [open, setOpen] = useState(false);
  const { m } = useLocalization();

  useEffect(() => {
    // Show the drawer automatically on mount
    setOpen(true);
  }, []);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="pb-6 max-w-md mx-auto">
        <DrawerHeader>
          <IconAlertTriangleFilled className="text-amber-500 w-12 h-12 mx-auto mb-2" />
          <DrawerTitle className="text-xl">{m.DeprecationTitle()}</DrawerTitle>
          <DrawerDescription className="text-balance text-base">
            {m.DeprecationDescription()}
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="gap-3">
          <Button
            variant="default"
            size="lg"
            onClick={() => {
              window.open("https://gider.im", "_blank");
            }}
          >
            {m.GoToNewApp()}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            {m.ContinueAnyway()}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
