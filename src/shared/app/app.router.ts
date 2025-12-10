import { Express } from "express";
import { inject, injectable } from "tsyringe";

import { IRouter } from "@/shared/interfaces";

import { UserSymbols } from "@/domain/user";
import { OrganizationSymbols } from "@/domain/organization";
import { UserPermissionSymbols } from "@/domain/user-permission";
import { RoleSymbols } from "@/domain/role";
import { ScopeSymbols } from "@/domain/scope";

@injectable()
export class AppRouter implements IRouter {
  constructor(
    @inject(UserSymbols.UserRouter)
    private userRouter: IRouter,
    @inject(OrganizationSymbols.OrganizationRouter)
    private organizationRouter: IRouter,
    @inject(UserPermissionSymbols.UserPermissionRouter)
    private userPermissionRouter: IRouter,
    @inject(RoleSymbols.RoleRouter)
    private roleRouter: IRouter,
    @inject(ScopeSymbols.ScopeRouter)
    private scopeRouter: IRouter
  ) {}

  public register(server: Express) {
    this.userRouter.register(server);
    this.organizationRouter.register(server);
    this.userPermissionRouter.register(server);
    this.roleRouter.register(server);
    this.scopeRouter.register(server);
  }
}
