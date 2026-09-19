// Azure Functions v4 programming model entry point: importing each function
// module runs its app.http(...) registration as a side effect. This file is
// what `main` in package.json points at once built.

import './functions/getVisit';
import './functions/extractVisit';
import './functions/syncVisit';
import './functions/saveVisitState';
