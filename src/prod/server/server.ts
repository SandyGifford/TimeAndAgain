import prodApp from "./prodApp";

prodApp.listen(process.env.APP_PORT, () => console.log(`server running on port ${process.env.APP_PORT}`));
