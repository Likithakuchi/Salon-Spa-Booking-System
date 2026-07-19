from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import db

# --- Login API Helper ---
@api_view(['POST'])
def login_view(request):
    try:
        data = request.data
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Admin check
        if email == 'admin@salon.com' and password == 'admin123':
            return Response({
                'role': 'admin',
                'full_name': 'System Administrator',
                'email': 'admin@salon.com'
            }, status=status.HTTP_200_OK)
            
        # Customer check
        customers = db.get_customers()
        for c in customers:
            if c['email'] == email and c['password'] == password:
                return Response({
                    'role': 'customer',
                    'customer_id': c['customer_id'],
                    'full_name': c['full_name'],
                    'email': c['email'],
                    'phone': c['phone'],
                    'gender': c['gender']
                }, status=status.HTTP_200_OK)
                
        return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# --- Customer Endpoints ---
@api_view(['POST'])
def add_customer(request):
    try:
        data = request.data
        required = ['full_name', 'email', 'phone', 'gender', 'password']
        for field in required:
            if field not in data:
                return Response({'error': f'Field {field} is required'}, status=status.HTTP_400_BAD_REQUEST)
                
        # Check if email already exists to enforce constraint
        customers = db.get_customers()
        if any(c['email'] == data['email'] for c in customers):
            return Response({'error': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)
            
        cid = db.add_customer(data)
        created = db.get_customer_by_id(cid)
        return Response(created, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_customers(request):
    try:
        customers = db.get_customers()
        return Response(customers, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
def update_customer(request, pk):
    try:
        pk_val = int(pk)
        data = request.data
        success = db.update_customer(pk_val, data)
        if success:
            updated = db.get_customer_by_id(pk_val)
            return Response(updated, status=status.HTTP_200_OK)
        return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def delete_customer(request, pk):
    try:
        pk_val = int(pk)
        success = db.delete_customer(pk_val)
        if success:
            return Response({'message': 'Customer deleted successfully'}, status=status.HTTP_200_OK)
        return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# --- Service Endpoints ---
@api_view(['POST'])
def add_service(request):
    try:
        data = request.data
        required = ['service_name', 'category', 'duration', 'price']
        for field in required:
            if field not in data:
                return Response({'error': f'Field {field} is required'}, status=status.HTTP_400_BAD_REQUEST)
                
        # Validate Category
        categories = ['Hair Cut', 'Hair Styling', 'Hair Coloring', 'Facial', 'Spa', 'Massage', 'Manicure', 'Pedicure']
        if data['category'] not in categories:
            return Response({'error': f"Category must be one of: {', '.join(categories)}"}, status=status.HTTP_400_BAD_REQUEST)
            
        sid = db.add_service(data)
        created = db.get_service_by_id(sid)
        return Response(created, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_services(request):
    try:
        services = db.get_services()
        return Response(services, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
def update_service(request, pk):
    try:
        pk_val = int(pk)
        data = request.data
        
        # Validate category if updating it
        if 'category' in data:
            categories = ['Hair Cut', 'Hair Styling', 'Hair Coloring', 'Facial', 'Spa', 'Massage', 'Manicure', 'Pedicure']
            if data['category'] not in categories:
                return Response({'error': f"Category must be one of: {', '.join(categories)}"}, status=status.HTTP_400_BAD_REQUEST)
                
        success = db.update_service(pk_val, data)
        if success:
            updated = db.get_service_by_id(pk_val)
            return Response(updated, status=status.HTTP_200_OK)
        return Response({'error': 'Service not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def delete_service(request, pk):
    try:
        pk_val = int(pk)
        success = db.delete_service(pk_val)
        if success:
            return Response({'message': 'Service deleted successfully'}, status=status.HTTP_200_OK)
        return Response({'error': 'Service not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# --- Stylist Endpoints ---
@api_view(['POST'])
def add_stylist(request):
    try:
        data = request.data
        required = ['stylist_name', 'specialization', 'experience', 'phone', 'availability']
        for field in required:
            if field not in data:
                return Response({'error': f'Field {field} is required'}, status=status.HTTP_400_BAD_REQUEST)
                
        # Validate availability
        availabilities = ['Available', 'Busy', 'Leave']
        if data['availability'] not in availabilities:
            return Response({'error': f"Availability must be one of: {', '.join(availabilities)}"}, status=status.HTTP_400_BAD_REQUEST)
            
        sid = db.add_stylist(data)
        created = db.get_stylist_by_id(sid)
        return Response(created, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_stylists(request):
    try:
        stylists = db.get_stylists()
        return Response(stylists, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
def update_stylist(request, pk):
    try:
        pk_val = int(pk)
        data = request.data
        
        # Validate availability if updating it
        if 'availability' in data:
            availabilities = ['Available', 'Busy', 'Leave']
            if data['availability'] not in availabilities:
                return Response({'error': f"Availability must be one of: {', '.join(availabilities)}"}, status=status.HTTP_400_BAD_REQUEST)
                
        success = db.update_stylist(pk_val, data)
        if success:
            updated = db.get_stylist_by_id(pk_val)
            return Response(updated, status=status.HTTP_200_OK)
        return Response({'error': 'Stylist not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def delete_stylist(request, pk):
    try:
        pk_val = int(pk)
        success = db.delete_stylist(pk_val)
        if success:
            return Response({'message': 'Stylist deleted successfully'}, status=status.HTTP_200_OK)
        return Response({'error': 'Stylist not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# --- Appointment Endpoints ---
@api_view(['POST'])
def add_appointment(request):
    try:
        data = request.data
        required = ['customer_name', 'stylist_name', 'service_name', 'appointment_date', 'appointment_time', 'total_amount', 'appointment_status']
        for field in required:
            if field not in data:
                return Response({'error': f'Field {field} is required'}, status=status.HTTP_400_BAD_REQUEST)
                
        # Validate Status
        statuses = ['Booked', 'Completed', 'Cancelled']
        if data['appointment_status'] not in statuses:
            return Response({'error': f"Status must be one of: {', '.join(statuses)}"}, status=status.HTTP_400_BAD_REQUEST)
            
        aid = db.add_appointment(data)
        created = db.get_appointment_by_id(aid)
        return Response(created, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_appointments(request):
    try:
        appointments = db.get_appointments()
        return Response(appointments, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
def update_appointment(request, pk):
    try:
        pk_val = int(pk)
        data = request.data
        
        # Validate status if updating it
        if 'appointment_status' in data:
            statuses = ['Booked', 'Completed', 'Cancelled']
            if data['appointment_status'] not in statuses:
                return Response({'error': f"Status must be one of: {', '.join(statuses)}"}, status=status.HTTP_400_BAD_REQUEST)
                
        success = db.update_appointment(pk_val, data)
        if success:
            updated = db.get_appointment_by_id(pk_val)
            return Response(updated, status=status.HTTP_200_OK)
        return Response({'error': 'Appointment not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def delete_appointment(request, pk):
    try:
        pk_val = int(pk)
        success = db.delete_appointment(pk_val)
        if success:
            return Response({'message': 'Appointment deleted successfully'}, status=status.HTTP_200_OK)
        return Response({'error': 'Appointment not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# --- Payment Endpoints ---
@api_view(['POST'])
def add_payment(request):
    try:
        data = request.data
        required = ['customer_name', 'appointment_id', 'amount', 'payment_method', 'payment_status', 'payment_date']
        for field in required:
            if field not in data:
                return Response({'error': f'Field {field} is required'}, status=status.HTTP_400_BAD_REQUEST)
                
        # Validate status & method
        methods = ['UPI', 'Credit Card', 'Debit Card', 'Cash']
        statuses = ['Paid', 'Pending', 'Failed']
        if data['payment_method'] not in methods:
            return Response({'error': f"Payment method must be one of: {', '.join(methods)}"}, status=status.HTTP_400_BAD_REQUEST)
        if data['payment_status'] not in statuses:
            return Response({'error': f"Payment status must be one of: {', '.join(statuses)}"}, status=status.HTTP_400_BAD_REQUEST)
            
        pid = db.add_payment(data)
        created = db.get_payment_by_id(pid)
        return Response(created, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_payments(request):
    try:
        payments = db.get_payments()
        return Response(payments, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
def update_payment(request, pk):
    try:
        pk_val = int(pk)
        data = request.data
        
        # Validate if updating
        if 'payment_method' in data:
            methods = ['UPI', 'Credit Card', 'Debit Card', 'Cash']
            if data['payment_method'] not in methods:
                return Response({'error': f"Payment method must be one of: {', '.join(methods)}"}, status=status.HTTP_400_BAD_REQUEST)
        if 'payment_status' in data:
            statuses = ['Paid', 'Pending', 'Failed']
            if data['payment_status'] not in statuses:
                return Response({'error': f"Payment status must be one of: {', '.join(statuses)}"}, status=status.HTTP_400_BAD_REQUEST)
                
        success = db.update_payment(pk_val, data)
        if success:
            updated = db.get_payment_by_id(pk_val)
            return Response(updated, status=status.HTTP_200_OK)
        return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def delete_payment(request, pk):
    try:
        pk_val = int(pk)
        success = db.delete_payment(pk_val)
        if success:
            return Response({'message': 'Payment deleted successfully'}, status=status.HTTP_200_OK)
        return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
