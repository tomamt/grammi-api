const debug = require('debug')('grammi-api:services/auth0');
// const constant = require('../utilities/constant');
const { AuthenticationClient } = require('auth0');
const { ManagementClient } = require('auth0');
const config = require('../config/config');

const auth0 = new AuthenticationClient({
  domain: config.api.auth0Domain,
  clientId: config.api.auth0ClientId,
  clientSecret: config.api.auth0ClientSecret,
});

const auth0Service = {
  createManagementClient: (accessToken) => {
    const management = new ManagementClient({
      token: accessToken,
      domain: config.api.auth0Domain,
    });
    return management;
  },
  generateToken: async () => new Promise((resolve, reject) => {
    auth0.clientCredentialsGrant(
      {
        audience: `https://${config.api.auth0Domain}/api/v2/`,
      },
      (err, response) => {
        if (err) {
          // Handle error.
          debug(`auth0 created error ${err}`);
          reject(err);
        } else {
          // debug(`auth0 token generated`, response.access_token);
          resolve(response.access_token);
        }
      },
    );
  }),
  createUser: async (createUserData, token) => new Promise((resolve, reject) => {
    const management = new ManagementClient({
      token,
      domain: config.api.auth0Domain,
    });
    const data = {
      connection: config.api.auth0Connection,
      email: createUserData.email,
      name: createUserData.name,
      password: createUserData.randomPassword,
      user_metadata: createUserData.user_metadata,
    };
    management
      .createUser(data)
      .then((users) => {
        debug(`auth0 create user success ${JSON.stringify(users)}`);
        resolve(users);
      })
      .catch((err) => {
        // Handle error.
        debug(`auth0 create user error ${err}`);
        reject(err);
      });
  }),
  assignRolestoUser: async (roleData, token) => new Promise((resolve, reject) => {
    const management = auth0Service.createManagementClient(token);
    const params = { id: roleData.auth0Id };
    const data = { roles: [roleData.auth0RoleId] };
    management
      .assignRolestoUser(params, data)
      .then((roleRes) => {
        debug(`auth0 assignRolestoUser success ${JSON.stringify(roleRes)}`);
        resolve(roleRes);
      })
      .catch((err) => {
        // Handle error.
        debug(`auth0 assignRolestoUser error ${err}`);
        reject(err);
      });
  }),
  createRole: async (roleData, token) => new Promise((resolve, reject) => {
    const management = auth0Service.createManagementClient(token);
    const data = { name: roleData.name };
    management
      .createRole(data)
      .then((roleRes) => {
        debug(`auth0 createRole success ${JSON.stringify(roleRes)}`);
        resolve(roleRes);
      })
      .catch((err) => {
        // Handle error.
        debug(`auth0 createRole error ${err}`);
        reject(err);
      });
  }),
  addPermissionsInRole: async (permissionData, token) => new Promise((resolve, reject) => {
    const management = auth0Service.createManagementClient(token);
    const params = { id: permissionData.auth0RoleId };
    const data = { permissions: permissionData.rolePermission };
    management
      .addPermissionsInRole(params, data)
      .then((roleRes) => {
        debug(`auth0 addPermissionsInRole success ${JSON.stringify(roleRes)}`);
        resolve(roleRes);
      })
      .catch((err) => {
        // Handle error.
        debug(`auth0 addPermissionsInRole error ${err}`);
        reject(err);
      });
  }),
  updateResourceServer: async (resourceServerData, token) => new Promise((resolve, reject) => {
    const management = auth0Service.createManagementClient(token);
    const data = { scopes: resourceServerData.permissions };
    const params = { id: resourceServerData.resourceServerIdentifier };
    management
      .updateResourceServer(params, data)
      .then((resourceRes) => {
        // debug(`auth0 updateResourceServer success ${JSON.stringify(resourceRes)}`);
        resolve(resourceRes);
      })
      .catch((err) => {
        // Handle error.
        debug(`auth0 updateResourceServer error ${err}`);
        reject(err);
      });
  }),
  requestChangePasswordEmail: async (changePasswordData /* , token */) => new Promise(
    (resolve, reject) => {
      const data = {
        connection: config.api.auth0Connection,
        email: changePasswordData.email,
      };
      auth0.database.requestChangePasswordEmail(data)
        .then((mailResponse) => {
          debug(`auth0 requestChangePasswordEmail success ${JSON.stringify(mailResponse)}`);
          resolve(mailResponse);
        })
        .catch((err) => {
          debug(`auth0 requestChangePasswordEmail error ${err}`);
          reject(err);
        });
    },
  ),
  createEmailVerificationTicket: async (emailTicket, token) => new Promise((resolve, reject) => {
    const management = auth0Service.createManagementClient(token);
    const data = {
      user_id: emailTicket.auth0Id,
      result_url: 'https://grammi.amt.in/login?userRole=deliveryAgent', // Optional redirect after the ticket is used.
    };
    management
      .createEmailVerificationTicket(data)
      .then((mailResponse) => {
        debug(`auth0 createEmailVerificationTicket success ${JSON.stringify(mailResponse)}`);
        resolve(mailResponse);
      })
      .catch((err) => {
        // Handle error.
        debug(`auth0 createEmailVerificationTicket error ${err}`);
        reject(err);
      });
  }),
  updateUser: async (updateUserData, token) => new Promise((resolve, reject) => {
    const management = new ManagementClient({
      token,
      domain: config.api.auth0Domain,
    });
    const { data } = updateUserData;
    const params = { id: updateUserData.auth0Id };
    management
      .updateUser(params, data)
      .then((users) => {
        debug(`auth0 update user success ${JSON.stringify(users)}`);
        resolve(users);
      })
      .catch((err) => {
        debug(`auth0 update user error ${err}`);
        reject(err);
      });
  }),
  deleteUser: async (deleteData, token) => new Promise((resolve, reject) => {
    const management = new ManagementClient({
      token,
      domain: config.api.auth0Domain,
    });
    const params = { id: deleteData.auth0Id };
    management
      .deleteUser(params)
      .then((users) => {
        debug(`auth0 deleteUser success ${JSON.stringify(users)}`);
        resolve(users);
      })
      .catch((err) => {
        debug(`auth0 deleteUser error ${err}`);
        reject(err);
      });
  }),
};
module.exports = auth0Service;
