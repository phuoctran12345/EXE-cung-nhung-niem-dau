import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  PartnerApplication,
  PartnerApplicationDocument,
} from './schemas/partner-application.schema';
import { CreatePartnerApplicationDto } from './dto/create-partner-application.dto';
import { UsersService } from '../users/users.service';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';

@Injectable()
export class PartnerApplicationsService {
  constructor(
    @InjectModel(PartnerApplication.name)
    private applicationModel: Model<PartnerApplicationDocument>,
    private usersService: UsersService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(userId: string, dto: CreatePartnerApplicationDto) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    if (user.role === 'tour_owner') {
      throw new BadRequestException('Tài khoản đã là nhà cung cấp tour');
    }
    if (user.role === 'admin') {
      throw new BadRequestException('Admin không thể đăng ký đối tác');
    }

    const existingPending = await this.applicationModel.findOne({
      userId: new Types.ObjectId(userId),
      status: 'pending',
    });
    if (existingPending) {
      throw new BadRequestException(
        'Bạn đã có hồ sơ đang chờ duyệt. Vui lòng chờ Admin phản hồi.',
      );
    }

    const application = new this.applicationModel({
      ...dto,
      userId: new Types.ObjectId(userId),
      status: 'pending',
    });
    return application.save();
  }

  async findMyApplication(userId: string) {
    return this.applicationModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAll(status?: string) {
    const filter = status ? { status } : {};
    return this.applicationModel
      .find(filter)
      .populate('userId', 'name email phone avatarUrl role status')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string) {
    const application = await this.applicationModel
      .findById(id)
      .populate('userId', 'name email phone avatarUrl role status')
      .populate('reviewedBy', 'name email')
      .exec();
    if (!application) {
      throw new NotFoundException('Không tìm thấy hồ sơ đăng ký');
    }
    return application;
  }

  async approve(id: string, adminId: string) {
    const application = await this.applicationModel.findById(id);
    if (!application) {
      throw new NotFoundException('Không tìm thấy hồ sơ đăng ký');
    }
    if (application.status !== 'pending') {
      throw new BadRequestException('Hồ sơ này đã được xử lý');
    }

    await this.usersService.updateRole(
      application.userId.toString(),
      'tour_owner',
    );

    application.status = 'approved';
    application.reviewedAt = new Date();
    application.reviewedBy = new Types.ObjectId(adminId);
    application.rejectionReason = undefined;
    return application.save();
  }

  async reject(id: string, adminId: string, reason: string) {
    const application = await this.applicationModel.findById(id);
    if (!application) {
      throw new NotFoundException('Không tìm thấy hồ sơ đăng ký');
    }
    if (application.status !== 'pending') {
      throw new BadRequestException('Hồ sơ này đã được xử lý');
    }

    application.status = 'rejected';
    application.rejectionReason = reason;
    application.reviewedAt = new Date();
    application.reviewedBy = new Types.ObjectId(adminId);
    return application.save();
  }

  async fetchLicenseFile(id: string) {
    const application = await this.applicationModel.findById(id);
    if (!application) {
      throw new NotFoundException('Không tìm thấy hồ sơ đăng ký');
    }
    if (!application.licenseUrl) {
      throw new NotFoundException('Hồ sơ không có giấy phép kinh doanh');
    }

    console.log('[PartnerApplications] fetchLicenseFile', {
      id,
      licenseUrl: application.licenseUrl,
    });

    let buffer: Buffer;
    try {
      buffer = await this.cloudinaryService.downloadByUrl(
        application.licenseUrl,
      );
    } catch (err) {
      console.error('[PartnerApplications] fetchLicenseFile failed', err);
      throw new NotFoundException('Không tải được tài liệu từ Cloudinary');
    }

    const url = application.licenseUrl.toLowerCase();
    let contentType = 'application/octet-stream';

    const isPdf =
      buffer.subarray(0, 4).toString() === '%PDF' ||
      url.includes('.pdf') ||
      contentType.includes('pdf');

    if (isPdf) {
      contentType = 'application/pdf';
    } else if (url.includes('.png') || contentType.includes('png')) {
      contentType = 'image/png';
    } else if (
      url.includes('.jpg') ||
      url.includes('.jpeg') ||
      contentType.includes('jpeg')
    ) {
      contentType = 'image/jpeg';
    }

    const ext = contentType.includes('pdf')
      ? 'pdf'
      : contentType.includes('png')
        ? 'png'
        : 'jpg';

    return {
      buffer,
      contentType,
      filename: `${application.companyName.replace(/\s+/g, '-')}-giay-phep.${ext}`,
    };
  }

  // Hàm tải file PDF hợp đồng từ Cloudinary về buffer
  async fetchContractFile(id: string) {
    const application = await this.applicationModel.findById(id);
    if (!application) {
      throw new NotFoundException('Không tìm thấy hồ sơ đăng ký');
    }
    if (!application.contractUrl) {
      throw new NotFoundException('Hồ sơ không có PDF hợp đồng');
    }

    console.log('[PartnerApplications] fetchContractFile', {
      id,
      contractUrl: application.contractUrl,
    });

    let buffer: Buffer;
    try {
      buffer = await this.cloudinaryService.downloadByUrl(application.contractUrl);
    } catch (err) {
      console.error('[PartnerApplications] fetchContractFile failed', err);
      throw new NotFoundException('Không tải được hợp đồng từ Cloudinary');
    }

    return {
      buffer,
      contentType: 'application/pdf',
      filename: `${application.companyName.replace(/\s+/g, '-')}-hop-dong.pdf`,
    };
  }
}
