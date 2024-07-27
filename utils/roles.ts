// utils/roles.ts
export const ROLES = {
    STORE_MANAGER: 'STORE_MANAGER',
    SALES_ASSOCIATE: 'SALES_ASSOCIATE',
    INVENTORY_MANAGER: 'INVENTORY_MANAGER',
    ADMIN: 'ADMIN',
    USER: 'USER'
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const getRoleColor = (role: Role): string => {
    switch (role) {
        case ROLES.ADMIN:
            return '#FFD700'; // Gold
        case ROLES.STORE_MANAGER:
            return '#00CED1'; // Dark Turquoise
        case ROLES.INVENTORY_MANAGER:
            return '#98FB98'; // Pale Green
        case ROLES.SALES_ASSOCIATE:
            return '#FFA07A'; // Light Salmon
        case ROLES.USER:
            return '#FF8C00'; // orange
        default:
            return '#FFFFFF'; // White
    }
};

export const getRoleLabel = (role: Role): string => {
    switch (role) {
        case ROLES.ADMIN:
            return 'Admin';
        case ROLES.STORE_MANAGER:
            return 'Store Manager';
        case ROLES.INVENTORY_MANAGER:
            return 'Inventory Manager';
        case ROLES.SALES_ASSOCIATE:
            return 'Sales Associate';
        case ROLES.USER:
            return 'Customer';
        default:
            return role;
    }
};

export const getDropdownRoles = () => {
    return Object.entries(ROLES)
        .filter(([key, _]) => key !== 'ADMIN')
        .map(([_, value]) => ({
            key: value,
            label: getRoleLabel(value as Role)
        }));
};
