from django.urls import path
import views

urlpatterns = [
    # Login API
    path('login/', views.login_view, name='login'),
    
    # Customer APIs
    path('customers/add/', views.add_customer, name='add_customer'),
    path('customers/', views.get_customers, name='get_customers'),
    path('customers/update/<int:pk>/', views.update_customer, name='update_customer'),
    path('customers/delete/<int:pk>/', views.delete_customer, name='delete_customer'),
    
    # Service APIs
    path('services/add/', views.add_service, name='add_service'),
    path('services/', views.get_services, name='get_services'),
    path('services/update/<int:pk>/', views.update_service, name='update_service'),
    path('services/delete/<int:pk>/', views.delete_service, name='delete_service'),
    
    # Stylist APIs
    path('stylists/add/', views.add_stylist, name='add_stylist'),
    path('stylists/', views.get_stylists, name='get_stylists'),
    path('stylists/update/<int:pk>/', views.update_stylist, name='update_stylist'),
    path('stylists/delete/<int:pk>/', views.delete_stylist, name='delete_stylist'),
    
    # Appointment APIs
    path('appointments/add/', views.add_appointment, name='add_appointment'),
    path('appointments/', views.get_appointments, name='get_appointments'),
    path('appointments/update/<int:pk>/', views.update_appointment, name='update_appointment'),
    path('appointments/delete/<int:pk>/', views.delete_appointment, name='delete_appointment'),
    
    # Payment APIs
    path('payments/add/', views.add_payment, name='add_payment'),
    path('payments/', views.get_payments, name='get_payments'),
    path('payments/update/<int:pk>/', views.update_payment, name='update_payment'),
    path('payments/delete/<int:pk>/', views.delete_payment, name='delete_payment'),
]
