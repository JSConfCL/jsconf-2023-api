import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  Validate,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { IsUnique } from '../../../../validations/unique.validation';

export class UpdateUserDTO {
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @MaxLength(255, {
    message: i18nValidationMessage('validation.MAX_LENGTH'),
  })
  @IsOptional()
  name: string;

  @IsEmail(undefined, {
    message: i18nValidationMessage('validation.INVALID_EMAIL'),
  })
  @MaxLength(255, {
    message: i18nValidationMessage('validation.MAX_LENGTH'),
  })
  @IsOptional()
  email: string;

  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @MaxLength(100, {
    message: i18nValidationMessage('validation.MAX_LENGTH'),
  })
  @IsOptional()
  @Validate(IsUnique, [{ table: 'users', column: 'username' }], {
    message: i18nValidationMessage('validation.IS_UNIQUE'),
  })
  username: string;

  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @MaxLength(100, {
    message: i18nValidationMessage('validation.MAX_LENGTH'),
  })
  @IsOptional()
  country: string;

  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @MaxLength(255, {
    message: i18nValidationMessage('validation.MAX_LENGTH'),
  })
  @IsOptional()
  company: string;

  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @MaxLength(255, {
    message: i18nValidationMessage('validation.MAX_LENGTH'),
  })
  @IsOptional()
  position: string;

  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @MaxLength(255, {
    message: i18nValidationMessage('validation.MAX_LENGTH'),
  })
  @IsOptional()
  seniority: string;

  @IsInt({
    message: i18nValidationMessage('validation.IS_INT'),
  })
  @Max(100, {
    message: i18nValidationMessage('validation.MAX'),
  })
  @Min(0, {
    message: i18nValidationMessage('validation.MIN'),
  })
  @IsOptional()
  yearsOfExperience: number;

  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @IsOptional()
  @MaxLength(200, {
    message: i18nValidationMessage('validation.MAX_LENGTH'),
  })
  gender: string;

  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @IsOptional()
  foodPreference: string;

  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @IsOptional()
  shirtSize: string;

  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @IsOptional()
  shirtStyle: string;

  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @IsOptional()
  foodAllergy: string;

  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @IsOptional()
  pronouns: string;
}
