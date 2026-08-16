from rest_framework.permissions import BasePermission
from core.enums import UserRole


class IsCustomer(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == UserRole.CUSTOMER)


class IsBroker(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and 
            request.user.role in (UserRole.BROKER, UserRole.SENIOR_BROKER, UserRole.PRICING_MANAGER, UserRole.ADMIN)
        )


class IsSeniorBroker(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and 
            request.user.role in (UserRole.SENIOR_BROKER, UserRole.PRICING_MANAGER, UserRole.ADMIN)
        )


class IsPricingManager(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and 
            request.user.role in (UserRole.PRICING_MANAGER, UserRole.ADMIN)
        )


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and 
            (request.user.role == UserRole.ADMIN or request.user.is_staff or request.user.is_superuser)
        )


class IsInternalStaff(BasePermission):
    """Allows any internal operations/broker/pricing/admin staff, blocks external customer portal users."""
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and 
            request.user.role != UserRole.CUSTOMER
        )
