import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AuthKey } from '../decorators/auth.decorator';
import { catchError, firstValueFrom, map } from 'rxjs';

@Injectable()
export class KeycloakAuthGuard implements CanActivate {
  constructor(
    private readonly _reflector: Reflector,
    private readonly _httpService: HttpService,
    private readonly _configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this._reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    // get authorization header
    const authorization = request.headers.authorization;
    if (!authorization) {
      return false;
    }

    const [type, token] = authorization.split(' ');

    if (type.toLowerCase() !== 'bearer') {
      return false;
    }

    // get resource and scope from metadata
    // check if resource defined first (at class level) and scope defined second (at method level)
    const getResource: { resource: string } =
      this._reflector.getAllAndOverride<{
        resource: string;
      }>(AuthKey, [context.getClass()]);

    const getScope: { scope: string } = this._reflector.getAllAndOverride<{
      scope: string;
    }>(AuthKey, [context.getHandler()]);

    // check if both resource and scope are defined at method level
    const resourceAndScope: { resource: string; scope: string } =
      this._reflector.getAllAndOverride<{ resource: string; scope: string }>(
        AuthKey,
        [context.getHandler(), context.getClass()],
      );

    // condition
    if (getResource && getScope) {
      resourceAndScope.resource = getResource.resource;
      resourceAndScope.scope = getScope.scope;
    }

    if (!resourceAndScope) {
      throw new ForbiddenException(
        'You are not authorized to access this resource',
      );
    }

    // keycloak template: resource#scope
    // example: report#create
    const permission = `${resourceAndScope.resource}#${resourceAndScope.scope}`;

    // call external service to make decision

    const requestBody = {
      grant_type: 'urn:ietf:params:oauth:grant-type:uma-ticket',
      audience: this._configService.get('KEYCLOAK_CLIENT_ID'),
      permission: permission,
      response_mode: 'decision', // for keycloak to return response as boolean [true|false]
    };

    const baseUrl = this._configService.get('KEYCLOAK_URL');
    const realm = this._configService.get('KEYCLOAK_REALM');

    return await firstValueFrom(
      this._httpService
        .post(
          `${baseUrl}/realms/${realm}/protocol/openid-connect/token`,
          requestBody,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        )
        .pipe(
          map((response) => {
            return response.data;
          }),
          catchError((error) => {
            throw new ForbiddenException(
              'You are not authorized to access this resource',
            );
          }),
        ),
    );
  }
}
