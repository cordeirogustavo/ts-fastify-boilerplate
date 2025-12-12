export type TLanguages = "pt" | "en";

type TTranslationFunction = (params?: Record<string, any>) => string;

type TTranslations = {
  [key in TLanguages]: {
    [key: string]: TTranslationFunction;
  };
};

export const translations: TTranslations = {
  pt: {
    userAlreadyExists: () =>
      "O usuário já cadastrado, se você esqueceu sua senha tente usar a opção esqueci minha senha",
    userCreated: () =>
      "O usuário foi criado com sucesso, você receberá um e-mail para ativação da sua conta",
    userUpdated: () => "O usuário foi atualizado com sucesso",
    invalidUserId: () => "Id de usuário inválido",
    invalidCredentials: () => "Credenciais inválidas",
    userNotFound: () => "O usuário não foi encontrado",
    invalidReCaptcha: () => "ReCaptcha inválido",
    failedInReCaptchaValidation: () =>
      "Falha na validação do reCaptcha, verifique o token informado",
    invalidToken: () => "Token inválido",
    expiredToken: () => "Token expirado",
    userNotAuthenticated: () => "Usuário não autenticado",
    hello: () => "Olá",
    emailConfirmation: () => "Bem vindo! Confirme seu endereço de email",
    welcomeActivateEmailMessage: () =>
      "Obrigado por se registrar! Para concluir o processo de criação de sua conta, por favor confirme seu endereço de email clicando no botão abaixo:",
    ignoreEmailMessage: () =>
      "Se você não realizou nenhuma solicitação em nosso site, por favor ignore este e-mail. Este link tem validade de 24 horas.",
    confirmAccount: () => "Confirmar Conta",
    allRightsReserved: () => "Todos os direitos reservados",
    forgotPasswordEmailMessage: () =>
      "Recebemos uma solicitação de redefinição de senha, para concluir o processo, por favor crie uma nova senha clicando no botão abaixo:",
    createNewPassword: () => "Criar Nova Senha",
    forgotPasswordRequestTitle: () => "Solicitação de redefinição de senha",
    forgotPasswordRequestMessage: () =>
      "Recebemos uma solicitação de redefinição de senha, para concluir o processo verifique seu email",
    failedGoogleLogin: () => "Falha na autenticação do Google",
    failedFacebookLogin: () => "Falha na autenticação do Facebook",
    unauthorized: () => "Não autorizado",
    iaModelNotFound: () => "Modelo de IA não encontrado",
    clientNotFound: () => "Cliente não encontrado",
    unauthorizedOperation: () => "Operação não autorizada",
    dataSourceNotFound: () => "Data Source não encontrado",
    userClientNotFound: () =>
      "Usuário não possui cliente, se você já adicionou os clientes tente fazer login novamente.",
    toolNotFound: () => "Ferramenta não encontrada",
    changeAllowedOnlyForApiProvider: () =>
      "Usuários que se cadastraram via Facebook ou Google não podem alterar suas senhas.",
    failedToUploadProfilePicture: () => "Falha ao carregar a imagem de perfil",
    invalidPasscode: () => "Código inválido",
    mfaNotEnabled: () => "Autenticação de dois fatores não habilitada",
    exceededAttempts: (params) =>
      `Você excedeu o número máximo de tentativas, tente novamente em ${
        params?.time || ""
      }`,
    passcodeNotEnabled: () => "Código de passcode não habilitado",
    passcodeExpired: () =>
      "Código de autenticação expirado, faça login novamente",
    twoFactorAuthenticationTitle: () =>
      "Código de autenticação de dois fatores",
    passcodeMessage: () =>
      "Use o código abaixo para completar o processo de autenticação de dois fatores:",
    passcodeExpirationMessage: (params) =>
      `Este código expira em ${
        params?.minutes || ""
      } minutos. Se você não solicitou este código, ignore este email.`,
    organization: () => "Organização",
    organizationNotFound: () => "Organização não encontrada",
    failedToCreateOrganization: () => "Falha ao criar organização",
    invalidUserPermission: () =>
      "Permissão de usuário inválida, permissão já existe ou usuário/organização inválidos",
    userOrOrganizationNotFound: () => "Usuário ou organização não encontrados",
    missingGlobalScopes: () => "Falta de permissões globais",
    insufficientGlobalScopes: () => "Permissões globais insuficientes",
    missingUserOrganizations: () => "Falta de organizações do usuário",
    userNotInOrganization: () => "Usuário não está na organização",
    insufficientOrganizationScopes: () =>
      "Permissões da organização insuficientes",
    roleNotFound: () => "Perfil não encontrado",
  },
  en: {
    userAlreadyExists: () =>
      "User already registered, if you forgot your password, try using forgot password option",
    userCreated: () =>
      "User created successfully, you will receive an email to activate your account",
    userUpdated: () => "User updated successfully",
    invalidUserId: () => "Invalid user id",
    invalidCredentials: () => "Invalid credentials",
    userNotFound: () => "User not found",
    invalidReCaptcha: () => "Invalid reCaptcha",
    failedInReCaptchaValidation: () =>
      "Failed in reCaptcha validation, check the token informed",
    invalidToken: () => "Invalid token",
    expiredToken: () => "Token expired",
    userNotAuthenticated: () => "User not authenticated",
    hello: () => "Hi",
    emailConfirmation: () => "Welcome! Confirm your email address",
    welcomeActivateEmailMessage: () =>
      "Thank you for registering! To complete the registration process, please confirm your email address by clicking on the button below:",
    ignoreEmailMessage: () =>
      "If you did not make any request on our site, please ignore this email. This link has a validity of 24 hours.",
    confirmAccount: () => "Confirm Account",
    allRightsReserved: () => "All rights reserved",
    forgotPasswordEmailMessage: () =>
      "We received a request to reset your password, to complete the process, please create a new password by clicking on the button below:",
    createNewPassword: () => "Create New Password",
    forgotPasswordRequestTitle: () => "Reset password requested",
    forgotPasswordRequestMessage: () =>
      "We received a request to reset your password, to complete the process, please check your email",
    failedGoogleLogin: () => "Failed in Google login",
    failedFacebookLogin: () => "Failed in Facebook login",
    unauthorized: () => "Unauthorized",
    iaModelNotFound: () => "IA Model not found",
    clientNotFound: () => "Client not found",
    unauthorizedOperation: () => "Unauthorized operation",
    dataSourceNotFound: () => "Data Source not found",
    userClientNotFound: () =>
      "User does not have a client, if you already added the clients try to login again.",
    toolNotFound: () => "Tool not found",
    changeAllowedOnlyForApiProvider: () =>
      "Users registered via Facebook or Google cannot change their passwords.",
    failedToUploadProfilePicture: () => "Failed to upload profile picture",
    invalidPasscode: () => "Invalid passcode",
    mfaNotEnabled: () => "Two factor authentication not enabled",
    exceededAttempts: (params) =>
      `You have exceeded the maximum number of attempts, try again in ${
        params?.time || ""
      }`,
    passcodeNotEnabled: () => "Passcode not enabled",
    passcodeExpired: () => "Authentication code expired, please login again",
    twoFactorAuthenticationTitle: () => "Two-factor authentication code",
    passcodeMessage: () =>
      "Use the code below to complete the two-factor authentication process:",
    passcodeExpirationMessage: (params) =>
      `This code expires in ${
        params?.minutes || ""
      } minutes. If you didn't request this code, please ignore this email.`,
    organization: () => "Organization",
    organizationNotFound: () => "Organization not found",
    failedToCreateOrganization: () => "Failed to create organization",
    invalidUserPermission: () =>
      "Invalid user permission, permission already exists or received invalid user or organization",
    userOrOrganizationNotFound: () => "User or organization not found",
    missingGlobalScopes: () => "Missing global scopes",
    insufficientGlobalScopes: () => "Insufficient global scopes",
    missingUserOrganizations: () => "Missing user organizations",
    userNotInOrganization: () => "User not in organization",
    insufficientOrganizationScopes: () => "Insufficient organization scopes",
    roleNotFound: () => "Role not found",
  },
};

export const getTranslate = (
  key: string,
  language: string | null = "en",
  params: Record<string, any> = {}
) => {
  const translationFunction = translations[language as TLanguages][key];
  if (translationFunction) return translationFunction(params);
  return key;
};
