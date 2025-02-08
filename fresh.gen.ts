// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_404 from "./routes/_404.tsx";
import * as $_app from "./routes/_app.tsx";
import * as $api_process_image from "./routes/api/process-image.ts";
import * as $greet_name_ from "./routes/greet/[name].tsx";
import * as $index from "./routes/index.tsx";
import * as $Controls from "./islands/Controls.tsx";
import * as $FileDropZone from "./islands/FileDropZone.tsx";
import * as $FileTable from "./islands/FileTable.tsx";
import * as $Home from "./islands/Home.tsx";
import * as $PromptEditor from "./islands/PromptEditor.tsx";
import * as $ReceiptTable from "./islands/ReceiptTable.tsx";
import type { Manifest } from "$fresh/server.ts";

const manifest = {
	routes: {
		"./routes/_404.tsx": $_404,
		"./routes/_app.tsx": $_app,
		"./routes/api/process-image.ts": $api_process_image,
		"./routes/greet/[name].tsx": $greet_name_,
		"./routes/index.tsx": $index,
	},
	islands: {
		"./islands/Controls.tsx": $Controls,
		"./islands/FileDropZone.tsx": $FileDropZone,
		"./islands/FileTable.tsx": $FileTable,
		"./islands/Home.tsx": $Home,
		"./islands/PromptEditor.tsx": $PromptEditor,
		"./islands/ReceiptTable.tsx": $ReceiptTable,
	},
	baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;
