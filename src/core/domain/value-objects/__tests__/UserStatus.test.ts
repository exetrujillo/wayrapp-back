// src/core/domain/value-objects/__tests__/UserStatus.test.ts

import { UserStatus, UserStatusValue } from '../UserStatus';

describe('UserStatus Value Object', () => {
  describe('constructor', () => {
    it('debería crear un UserStatus válido con estados permitidos', () => {
      const validStatuses: UserStatusValue[] = [
        'active',
        'confirmation_pending',
        'suspended',
        'banned',
      ];

      validStatuses.forEach((status) => {
        const userStatus = new UserStatus(status);
        expect(userStatus.value).toBe(status);
      });
    });

    it('debería crear UserStatus con espacios al inicio y final', () => {
      const userStatus = new UserStatus('  active  ');
      expect(userStatus.value).toBe('active');
    });
  });

  describe('validaciones de error', () => {
    it('debería lanzar error con estado vacío', () => {
      expect(() => new UserStatus('')).toThrow(
        'El estado de usuario no puede estar vacío'
      );
    });

    it('debería lanzar error con estado solo espacios', () => {
      expect(() => new UserStatus('   ')).toThrow(
        'El estado de usuario no puede estar vacío'
      );
    });

    it('debería lanzar error con estado null o undefined', () => {
      expect(() => new UserStatus(null as unknown as string)).toThrow(
        'El estado de usuario no puede estar vacío'
      );
      expect(() => new UserStatus(undefined as unknown as string)).toThrow(
        'El estado de usuario no puede estar vacío'
      );
    });

    it('debería lanzar error con estados inválidos', () => {
      const invalidStatuses = [
        'invalid',
        'deleted',
        'inactive',
        'pending',
        'blocked',
      ];

      invalidStatuses.forEach((status) => {
        expect(() => new UserStatus(status)).toThrow(
          `Estado de usuario inválido: ${status}. Estados válidos: active, confirmation_pending, suspended, banned`
        );
      });
    });
  });

  describe('métodos de verificación de estado', () => {
    it('isActive() debería retornar true solo para estado active', () => {
      expect(new UserStatus('active').isActive()).toBe(true);
      expect(new UserStatus('confirmation_pending').isActive()).toBe(false);
      expect(new UserStatus('suspended').isActive()).toBe(false);
      expect(new UserStatus('banned').isActive()).toBe(false);
    });

    it('isPendingConfirmation() debería retornar true solo para estado confirmation_pending', () => {
      expect(
        new UserStatus('confirmation_pending').isPendingConfirmation()
      ).toBe(true);
      expect(new UserStatus('active').isPendingConfirmation()).toBe(false);
      expect(new UserStatus('suspended').isPendingConfirmation()).toBe(false);
      expect(new UserStatus('banned').isPendingConfirmation()).toBe(false);
    });

    it('isSuspended() debería retornar true solo para estado suspended', () => {
      expect(new UserStatus('suspended').isSuspended()).toBe(true);
      expect(new UserStatus('active').isSuspended()).toBe(false);
      expect(new UserStatus('confirmation_pending').isSuspended()).toBe(false);
      expect(new UserStatus('banned').isSuspended()).toBe(false);
    });

    it('isBanned() debería retornar true solo para estado banned', () => {
      expect(new UserStatus('banned').isBanned()).toBe(true);
      expect(new UserStatus('active').isBanned()).toBe(false);
      expect(new UserStatus('confirmation_pending').isBanned()).toBe(false);
      expect(new UserStatus('suspended').isBanned()).toBe(false);
    });
  });

  describe('métodos de negocio', () => {
    it('canLogin() debería retornar true solo para usuarios activos', () => {
      expect(new UserStatus('active').canLogin()).toBe(true);
      expect(new UserStatus('confirmation_pending').canLogin()).toBe(false);
      expect(new UserStatus('suspended').canLogin()).toBe(false);
      expect(new UserStatus('banned').canLogin()).toBe(false);
    });

    it('canBeReactivated() debería retornar true para suspended y confirmation_pending', () => {
      expect(new UserStatus('suspended').canBeReactivated()).toBe(true);
      expect(new UserStatus('confirmation_pending').canBeReactivated()).toBe(
        true
      );
      expect(new UserStatus('active').canBeReactivated()).toBe(false);
      expect(new UserStatus('banned').canBeReactivated()).toBe(false);
    });

    it('requiresEmailConfirmation() debería retornar true solo para confirmation_pending', () => {
      expect(
        new UserStatus('confirmation_pending').requiresEmailConfirmation()
      ).toBe(true);
      expect(new UserStatus('active').requiresEmailConfirmation()).toBe(false);
      expect(new UserStatus('suspended').requiresEmailConfirmation()).toBe(
        false
      );
      expect(new UserStatus('banned').requiresEmailConfirmation()).toBe(false);
    });

    it('isPermanentlyBlocked() debería retornar true solo para banned', () => {
      expect(new UserStatus('banned').isPermanentlyBlocked()).toBe(true);
      expect(new UserStatus('active').isPermanentlyBlocked()).toBe(false);
      expect(
        new UserStatus('confirmation_pending').isPermanentlyBlocked()
      ).toBe(false);
      expect(new UserStatus('suspended').isPermanentlyBlocked()).toBe(false);
    });
  });

  describe('factory methods', () => {
    it('debería crear estados específicos con factory methods', () => {
      expect(UserStatus.createActive().value).toBe('active');
      expect(UserStatus.createPendingConfirmation().value).toBe(
        'confirmation_pending'
      );
      expect(UserStatus.createSuspended().value).toBe('suspended');
      expect(UserStatus.createBanned().value).toBe('banned');
    });

    it('factory methods deberían crear objetos con comportamiento correcto', () => {
      const activeStatus = UserStatus.createActive();
      const pendingStatus = UserStatus.createPendingConfirmation();
      const suspendedStatus = UserStatus.createSuspended();
      const bannedStatus = UserStatus.createBanned();

      expect(activeStatus.isActive()).toBe(true);
      expect(pendingStatus.isPendingConfirmation()).toBe(true);
      expect(suspendedStatus.isSuspended()).toBe(true);
      expect(bannedStatus.isBanned()).toBe(true);
    });
  });

  describe('métodos de utilidad', () => {
    it('getDisplayName() debería retornar nombres legibles en español', () => {
      expect(new UserStatus('active').getDisplayName()).toBe('Activo');
      expect(new UserStatus('confirmation_pending').getDisplayName()).toBe(
        'Pendiente de confirmación'
      );
      expect(new UserStatus('suspended').getDisplayName()).toBe('Suspendido');
      expect(new UserStatus('banned').getDisplayName()).toBe('Baneado');
    });

    it('getValidStatuses() debería retornar todos los estados válidos', () => {
      const validStatuses = UserStatus.getValidStatuses();
      expect(validStatuses).toEqual([
        'active',
        'confirmation_pending',
        'suspended',
        'banned',
      ]);
      expect(validStatuses.length).toBe(4);
    });

    it('toString() debería retornar el valor del estado', () => {
      expect(new UserStatus('active').toString()).toBe('active');
      expect(new UserStatus('banned').toString()).toBe('banned');
    });
  });

  describe('comparación y igualdad', () => {
    it('equals() debería retornar true para estados iguales', () => {
      const status1 = new UserStatus('active');
      const status2 = new UserStatus('active');
      expect(status1.equals(status2)).toBe(true);
    });

    it('equals() debería retornar false para estados diferentes', () => {
      const activeStatus = new UserStatus('active');
      const bannedStatus = new UserStatus('banned');
      expect(activeStatus.equals(bannedStatus)).toBe(false);
    });

    it('debería considerar UserStatus iguales si tienen el mismo valor', () => {
      const status1 = new UserStatus('suspended');
      const status2 = new UserStatus('suspended');
      expect(status1.value).toBe(status2.value);
    });

    it('debería considerar UserStatus diferentes si tienen valores diferentes', () => {
      const status1 = new UserStatus('active');
      const status2 = new UserStatus('banned');
      expect(status1.value).not.toBe(status2.value);
    });
  });

  describe('casos de uso realistas', () => {
    it('debería manejar flujo de confirmación de email', () => {
      const pendingUser = UserStatus.createPendingConfirmation();

      expect(pendingUser.canLogin()).toBe(false);
      expect(pendingUser.requiresEmailConfirmation()).toBe(true);
      expect(pendingUser.canBeReactivated()).toBe(true);
    });

    it('debería manejar flujo de suspensión temporal', () => {
      const suspendedUser = UserStatus.createSuspended();

      expect(suspendedUser.canLogin()).toBe(false);
      expect(suspendedUser.canBeReactivated()).toBe(true);
      expect(suspendedUser.isPermanentlyBlocked()).toBe(false);
    });

    it('debería manejar flujo de baneo permanente', () => {
      const bannedUser = UserStatus.createBanned();

      expect(bannedUser.canLogin()).toBe(false);
      expect(bannedUser.canBeReactivated()).toBe(false);
      expect(bannedUser.isPermanentlyBlocked()).toBe(true);
    });

    it('debería manejar usuario activo normal', () => {
      const activeUser = UserStatus.createActive();

      expect(activeUser.canLogin()).toBe(true);
      expect(activeUser.requiresEmailConfirmation()).toBe(false);
      expect(activeUser.isPermanentlyBlocked()).toBe(false);
    });
  });
});
