export type TUserPermissionDTO = {
  global: string[];
  organizations: {
    [key: string]: {
      name: string;
      isDefault: boolean;
      scopes: string[];
    };
  };
};
