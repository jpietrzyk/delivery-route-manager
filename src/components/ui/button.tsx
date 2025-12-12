import * as React from "react";

function Button(props: React.ComponentProps<"button">) {
  return <button {...props} />;
}

export { Button };
// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants };
