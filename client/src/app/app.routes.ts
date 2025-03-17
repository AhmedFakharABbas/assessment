import { Routes } from "@angular/router";
import { BoardComponent } from "./board/board.component";
import { LoginComponent } from "./auth/login/login.component";
import { RegisterComponent } from "./auth/register/register.component";
import { AuthGuard } from "./guards/auth.guard";
import { CreateTaskComponent } from "./create-task/create-task.component";
import { TaskmapComponent } from "./taskmap/taskmap.component";

export const routes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },

  {
    path: "blog",
    loadChildren: () => import("./blog/blog.module").then((m) => m.BlogModule),
  },
  {
    path: "map",
    loadChildren: () => import("./map/map.module").then((m) => m.MapModule),
  },
  {
    path: "board",
    canActivate: [AuthGuard],
    component: BoardComponent,
  },
  {
    path: "create-task",
    canActivate: [AuthGuard],
    component: CreateTaskComponent,
  },
  {
    path: "task-navigator",
    canActivate: [AuthGuard],
    component: TaskmapComponent,
  },
  { path: "", redirectTo: "/login", pathMatch: "full" },
  { path: "**", redirectTo: "/login" },
];
