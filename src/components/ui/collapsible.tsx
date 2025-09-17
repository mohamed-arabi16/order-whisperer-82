import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

/**
 * A container that can be collapsed or expanded to show or hide content.
 * This component is based on the Radix UI Collapsible primitive.
 * @see https://www.radix-ui.com/docs/primitives/components/collapsible
 */
const Collapsible = CollapsiblePrimitive.Root;

/**
 * The button that toggles the open state of the collapsible content.
 */
const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

/**
 * The content that is shown or hidden when the collapsible is toggled.
 */
const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
