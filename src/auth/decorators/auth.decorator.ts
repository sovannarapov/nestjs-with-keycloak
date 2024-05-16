import { SetMetadata } from '@nestjs/common';

type KeycloakResources = 'category' | 'product';
type KeycloakScopes = 'read' | 'reads' | 'create' | 'update' | 'delete';

export const AuthKey = 'auth';

export const Auth = (data: {
  resource?: KeycloakResources;
  scope?: KeycloakScopes;
}) => SetMetadata(AuthKey, data);
