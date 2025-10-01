import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';
import dbConnect from '@/lib/mongodb';
import ExtendedUser from '@/lib/models/ExtendedUser';
import User from '@/lib/models/User';
import Event from '@/lib/models/Event';
import Notification from '@/lib/models/Notification';

// GET - Descargar todos los datos personales del usuario
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    
    if (!authResult.isValid || !authResult.session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    await dbConnect();

    const userId = authResult.session.userId;

    // Obtener datos del usuario desde ExtendedUser (más completo)
    let user: any = await ExtendedUser.findById(userId)
      .select('-password -emailVerificationToken -passwordResetToken')
      .lean();

    // Si no existe en ExtendedUser, intentar desde User
    if (!user) {
      user = await User.findById(userId)
        .select('-password -emailVerificationToken -passwordResetToken')
        .lean();
    }

    if (!user || Array.isArray(user)) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Obtener eventos del usuario
    const events = await Event.find({
      $or: [
        { participants: userId },
        { attendedParticipants: userId },
        { createdBy: userId }
      ]
    })
    .select('title description date location eventType participants attendedParticipants')
    .lean();

    // Obtener notificaciones del usuario
    const notifications = await Notification.find({ userId })
      .select('type title message priority isRead createdAt')
      .sort({ createdAt: -1 })
      .limit(100) // Limitar a las últimas 100 notificaciones
      .lean();

    // Construir objeto de datos personales
    const personalData = {
      metadata: {
        exportDate: new Date().toISOString(),
        exportedBy: userId,
        dataProtectionNote: 'Este archivo contiene todos tus datos personales almacenados en BSK Motorcycle Team. Protege este archivo adecuadamente.'
      },
      personalInformation: {
        basicInfo: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          documentType: user.documentType,
          documentNumber: user.documentNumber,
          dateOfBirth: user.dateOfBirth || user.birthDate,
          birthPlace: user.birthPlace,
          binaryGender: user.binaryGender,
          genderIdentity: user.genderIdentity,
          occupation: user.occupation || user.profession,
          discipline: user.discipline,
          maritalStatus: user.maritalStatus
        },
        contactInfo: {
          email: user.email,
          phone: user.phone,
          whatsapp: user.whatsapp,
          address: user.address,
          neighborhood: user.neighborhood,
          city: user.city,
          country: user.country,
          postalCode: user.postalCode
        },
        accountInfo: {
          membershipNumber: user.membershipNumber,
          membershipType: user.membershipType,
          role: user.role,
          isActive: user.isActive,
          accountStatus: user.accountStatus,
          joinDate: user.joinDate,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          lastLogin: user.lastLogin,
          lastActivity: user.lastActivity,
          isEmailVerified: user.isEmailVerified || user.emailVerified,
          phoneVerified: user.phoneVerified,
          profileCompletion: user.profileCompletion
        }
      },
      healthInformation: {
        bloodType: user.bloodType,
        rhFactor: user.rhFactor,
        allergies: user.allergies,
        healthInsurance: user.healthInsurance,
        medicalData: user.medicalData
      },
      emergencyContact: user.emergencyContact || {
        name: user.emergencyContactName,
        relationship: user.emergencyContactRelationship,
        phone: user.emergencyContactPhone,
        address: user.emergencyContactAddress,
        neighborhood: user.emergencyContactNeighborhood,
        city: user.emergencyContactCity,
        country: user.emergencyContactCountry,
        postalCode: user.emergencyContactPostalCode
      },
      motorcycleInformation: {
        motorcycles: user.motorcycleInfo?.motorcycles || [],
        licenses: user.motorcycleInfo?.licenses || [],
        basicInfo: {
          brand: user.motorcycleBrand,
          model: user.motorcycleModel,
          year: user.motorcycleYear,
          plate: user.motorcyclePlate,
          engineSize: user.motorcycleEngineSize,
          color: user.motorcycleColor,
          soatExpirationDate: user.soatExpirationDate,
          technicalReviewExpirationDate: user.technicalReviewExpirationDate
        },
        licenseInfo: {
          number: user.licenseNumber,
          category: user.licenseCategory,
          expirationDate: user.licenseExpirationDate
        },
        ridingExperience: user.motorcycleInfo?.ridingExperience,
        mechanicalSkills: user.motorcycleInfo?.mechanicalSkills
      },
      preferences: {
        language: user.language,
        timezone: user.timezone,
        notificationPreferences: user.notificationPreferences,
        privacySettings: user.privacySettings,
        privacy: user.privacy
      },
      activityHistory: {
        eventsRegistered: events.filter(e => e.participants?.includes(userId)).length,
        eventsAttended: events.filter(e => e.attendedParticipants?.includes(userId)).length,
        eventsCreated: events.filter(e => e.createdBy?.toString() === userId.toString()).length,
        events: events.map(event => ({
          id: event._id,
          title: event.title,
          description: event.description,
          date: event.date,
          location: event.location,
          eventType: event.eventType,
          role: event.createdBy?.toString() === userId.toString() ? 'creator' : 
                event.attendedParticipants?.includes(userId) ? 'attended' : 'registered'
        })),
        recentActivities: user.activities || [],
        totalNotifications: notifications.length,
        unreadNotifications: notifications.filter(n => !n.isRead).length,
        notifications: notifications.map(n => ({
          type: n.type,
          title: n.title,
          message: n.message,
          priority: n.priority,
          isRead: n.isRead,
          createdAt: n.createdAt
        }))
      },
      documents: user.documents || [],
      termsAndConditions: {
        acceptedTerms: user.acceptedTerms,
        acceptedPrivacyPolicy: user.acceptedPrivacyPolicy,
        acceptedDataProcessing: user.acceptedDataProcessing
      },
      twoFactorAuth: {
        enabled: user.twoFactorEnabled || false
      }
    };

    // Crear el contenido del archivo
    const content = JSON.stringify(personalData, null, 2);
    const blob = Buffer.from(content, 'utf-8');

    // Retornar el archivo como descarga
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="bskmt-datos-personales-${userId}-${Date.now()}.json"`,
        'Content-Length': blob.length.toString()
      }
    });
  } catch (error) {
    console.error('Error generando descarga de datos personales:', error);
    return NextResponse.json(
      { error: 'Error al generar archivo de datos personales' },
      { status: 500 }
    );
  }
}
