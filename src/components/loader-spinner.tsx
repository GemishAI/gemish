"use client";

import { Oval } from "react-loader-spinner";

export  function LoaderSpinner({width = '30', height = '30'}: {width?: string; height?: string}) {
	return (

			<Oval
				visible={true}
				height={height}
				width={width}
				color="var(--foreground)"
				secondaryColor="var(--foreground)"
				strokeWidth={5}
				ariaLabel="oval-loading"
			/>

	);
}
