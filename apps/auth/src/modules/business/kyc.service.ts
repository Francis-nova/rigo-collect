import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonKyc } from '../../entities/person-kyc.entity';
import { Business } from '../../entities/business.entity';
import { Director } from '../../entities/director.entity';
import { Document } from '../../entities/document.entity';
import { AuditAction, AuditLog } from '../../entities/audit-log.entity';
import { DirectorCreateDto, DirectorUpdateDto, DocumentCreateDto, DocumentStatus, DocumentType, ProofOfAddressCreateDto, BusinessKycStage, BusinessKYC } from '@pkg/dto';
import { ok } from '@pkg/common';

@Injectable()
export class KycService {
  constructor(
    @InjectRepository(Business) private readonly businessRepo: Repository<Business>,
    @InjectRepository(PersonKyc) private readonly personRepo: Repository<PersonKyc>,
    @InjectRepository(Director) private readonly directorRepo: Repository<Director>,
    @InjectRepository(Document) private readonly documentRepo: Repository<Document>,
    @InjectRepository(AuditLog) private readonly auditRepo: Repository<AuditLog>,
  ) { }

  async addDirector(businessId: string, payload: DirectorCreateDto, actorUserId?: string) {
    const person = this.personRepo.create({
      firstName: payload.firstName,
      lastName: payload.lastName,
      dateOfBirth: new Date(payload.dateOfBirth),
      nationality: payload.nationality,
      bvn: payload.bvn,
      email: payload.email,
      phone: payload.phone,
      residentialAddress: payload.residentialAddress,
      idType: payload.idType,
      idNumber: payload.idNumber,
      isPep: payload.isPep,
    });
    const savedPerson = await this.personRepo.save(person);

    const director = this.directorRepo.create({ businessId, personId: savedPerson.id });
    const savedDirector = await this.directorRepo.save(director);

    // Update KYC stage: at least one director collected
    await this.businessRepo.update(businessId, { kycStage: BusinessKycStage.DIRECTORS_COLLECTED });

    if (payload.idFileUrl) {
      const doc = this.documentRepo.create({
        businessId,
        directorId: savedDirector.id,
        documentType: DocumentType.DIRECTOR_ID,
        fileUrl: payload.idFileUrl,
        status: DocumentStatus.PENDING,
      });
      await this.documentRepo.save(doc);
    }

    await this.auditRepo.save(this.auditRepo.create({
      entityType: 'Director',
      entityId: savedDirector.id,
      action: AuditAction.CREATE,
      changes: payload,
      actorUserId: actorUserId,
    }));

    return ok({ savedDirector }, 'Director added successfully');
  }

  async listDirectors(businessId: string) {
    const directors = await this.directorRepo.find({ where: { businessId }, relations: ['person'] });
    return ok({ directors }, 'Directors retrieved successfully');
  }

  async updateDirector(businessId: string, directorId: string, payload: DirectorUpdateDto, actorUserId?: string) {
    const director = await this.directorRepo.findOne({ where: { id: directorId, businessId } });
    if (!director) throw new Error('Director not found');
    const person = await this.personRepo.findOne({ where: { id: director.personId } });
    if (!person) throw new Error('Person record missing');

    const updates: Partial<PersonKyc> = {};
    if (payload.firstName !== undefined) updates.firstName = payload.firstName;
    if (payload.lastName !== undefined) updates.lastName = payload.lastName;
    if (payload.dateOfBirth !== undefined) updates.dateOfBirth = new Date(payload.dateOfBirth);
    if (payload.nationality !== undefined) updates.nationality = payload.nationality;
    if (payload.bvn !== undefined) updates.bvn = payload.bvn;
    if (payload.email !== undefined) updates.email = payload.email;
    if (payload.phone !== undefined) updates.phone = payload.phone;
    if (payload.residentialAddress !== undefined) updates.residentialAddress = payload.residentialAddress;
    if (payload.idType !== undefined) updates.idType = payload.idType;
    if (payload.idNumber !== undefined) updates.idNumber = payload.idNumber;
    if (payload.isPep !== undefined) updates.isPep = payload.isPep;

    await this.personRepo.update(person.id, updates);

    if (payload.idFileUrl) {
      const doc = this.documentRepo.create({
        businessId,
        directorId: director.id,
        documentType: DocumentType.DIRECTOR_ID,
        fileUrl: payload.idFileUrl,
        status: DocumentStatus.PENDING,
      });
      await this.documentRepo.save(doc);
    }

    await this.auditRepo.save(this.auditRepo.create({
      entityType: 'Director',
      entityId: director.id,
      action: AuditAction.UPDATE,
      changes: payload,
      actorUserId: actorUserId,
    }));

    const updatedDirector = await this.directorRepo.findOne({ where: { id: directorId }, relations: ['person'] });
    return ok({ director: updatedDirector }, 'Director updated successfully');
  }

  async addDocument(businessId: string, payload: DocumentCreateDto, actorUserId?: string, directorId?: string) {
    const doc = this.documentRepo.create({
      businessId,
      directorId: directorId,
      documentType: payload.documentType,
      fileUrl: payload.fileUrl,
      issuedDate: payload.issuedDate ? new Date(payload.issuedDate) : null,
      status: DocumentStatus.PENDING,
    });
    const saved = await this.documentRepo.save(doc);

    // Update stage depending on document type
    if (payload.documentType === DocumentType.PROOF_OF_ADDRESS) {
      await this.businessRepo.update(businessId, { kycStage: BusinessKycStage.PROOF_OF_ADDRESS_UPLOADED });
    } else {
      await this.businessRepo.update(businessId, { kycStage: BusinessKycStage.DOCUMENTS_UPLOADED });
    }

    await this.auditRepo.save(this.auditRepo.create({
      entityType: 'Document',
      entityId: saved.id,
      action: AuditAction.CREATE,
      changes: payload,
      actorUserId: actorUserId,
    }));

    return ok({ saved }, 'Document updated successfully');
  }

  async listDocuments(businessId: string) {
    const documents = await this.documentRepo.find({ where: { businessId } });
    return ok({ documents }, 'Document retrieved successfully');
  }

  async addProofOfAddress(businessId: string, payload: ProofOfAddressCreateDto, actorUserId?: string) {
    const doc = this.documentRepo.create({
      businessId,
      documentType: DocumentType.PROOF_OF_ADDRESS,
      fileUrl: payload.fileUrl,
      issuedDate: payload.issuedDate ? new Date(payload.issuedDate) : null,
      status: DocumentStatus.PENDING,
    });
    const saved = await this.documentRepo.save(doc);

    await this.businessRepo.update(businessId, { kycStage: BusinessKycStage.PROOF_OF_ADDRESS_UPLOADED });

    await this.auditRepo.save(this.auditRepo.create({
      entityType: 'Document',
      entityId: saved.id,
      action: AuditAction.CREATE,
      changes: { ...payload, documentType: DocumentType.PROOF_OF_ADDRESS },
      actorUserId: actorUserId,
    }));

    return ok({ saved }, 'Proof of address successfully added');
  }

  async submitForReview(businessId: string, actorUserId?: string) {
    const readiness = await this.getKycReadiness(businessId);
    if (!readiness.complete) {
      throw new BadRequestException({ message: 'KYC incomplete. Please provide all required sections.', readiness });
    }
    await this.businessRepo.update(businessId, { kycStage: BusinessKycStage.REVIEW_IN_PROGRESS, kycStatus: BusinessKYC.IN_REVIEW });
    const updated = await this.businessRepo.findOne({ where: { id: businessId } });
    await this.auditRepo.save(this.auditRepo.create({
      entityType: 'Business',
      entityId: businessId,
      action: AuditAction.UPDATE,
      changes: { kycStage: BusinessKycStage.REVIEW_IN_PROGRESS, kycStatus: BusinessKYC.IN_REVIEW },
      actorUserId,
    }));
    return ok({ updated }, 'Business submitted for review successfully');
  }

  async getKycReadinessCheck(businessId: string) {
    const readiness = await this.getKycReadiness(businessId);
    return ok({ readiness }, 'KYC readiness retrieved successfully');
  }

  async getKycReadiness(businessId: string) {
    const business = await this.businessRepo.findOne({ where: { id: businessId } });
    const directors = await this.directorRepo.find({ where: { businessId } });
    const documents = await this.documentRepo.find({ where: { businessId } });

    const addressesComplete = !!(business?.registeredAddress && business?.operatingAddress);
    const directorsComplete = directors.length > 0;
    const tinPresent = !!business?.tinNumber;

    const requiredDocs: DocumentType[] = [
      DocumentType.CERTIFICATE_OF_INCORPORATION,
      DocumentType.CAC_STATUS_REPORT,
      DocumentType.TAX_IDENTIFICATION_NUMBER,
      DocumentType.PROOF_OF_ADDRESS,
    ];
    const docTypesPresent = new Set(documents.map((d) => d.documentType));
    const missingDocs = requiredDocs.filter((t) => !docTypesPresent.has(t));
    const proofOfAddressPresent = docTypesPresent.has(DocumentType.PROOF_OF_ADDRESS);

    const directorIdDocsMissing: string[] = [];
    for (const d of directors) {
      const hasIdDoc = documents.some((doc) => doc.documentType === DocumentType.DIRECTOR_ID && doc.directorId === d.id);
      if (!hasIdDoc) directorIdDocsMissing.push(d.id);
    }

    const complete = addressesComplete && directorsComplete && missingDocs.length === 0 && directorIdDocsMissing.length === 0 && proofOfAddressPresent && tinPresent;

    return {
      complete,
      sections: {
        addressesComplete,
        directorsComplete,
        requiredDocumentsUploaded: missingDocs.length === 0,
        proofOfAddressPresent,
        directorIdsUploadedForAllDirectors: directorIdDocsMissing.length === 0,
        tinPresent,
      },
      missing: {
        documents: missingDocs,
        directorIds: directorIdDocsMissing,
      },
    };
  }
}
