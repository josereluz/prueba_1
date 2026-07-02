-- Carga oficial CIC IGNFI V2. Fuente: CIC_IGNFI_V2 (5).xlsx
-- Recomendación: ejecutar primero en una copia/backup.

CREATE TABLE IF NOT EXISTS public.tg_poligono_cic_info (
  codigo_poligono text PRIMARY KEY,
  lote_empresa text,
  entregable_cod_ign_fi text,
  unidades_catastrales text,
  sector text,
  version text,
  n_cic text,
  cic_difusion text,
  fotografias_difusion text,
  cic_inicio text,
  fotografias_inicio text,
  cic_cierre text,
  fotografias_cierre text,
  distrito_oficial text,
  lote_oficial text,
  empresa_oficial text,
  fuente_oficial text,
  actualizado_en timestamp DEFAULT now()
);

TRUNCATE public.tg_poligono_cic_info;

INSERT INTO public.tg_poligono_cic_info (codigo_poligono, lote_empresa, entregable_cod_ign_fi, unidades_catastrales, sector, version, n_cic, cic_difusion, fotografias_difusion, cic_inicio, fotografias_inicio, cic_cierre, fotografias_cierre, distrito_oficial, lote_oficial, empresa_oficial, fuente_oficial)
VALUES
('251110143', 'Lote 4 - EXP', 'E01 / SM_01', '2920', '11', 'V1', 'CIC-1', '03/01/2026', NULL, '08/01/2026', NULL, '17/01/2026', NULL, 'San Miguel', '4', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('251110144', 'Lote 5 - Telespazio', 'E05 / CH_01', '2959', '19', 'V1', 'CIC-2', '03/01/2026', NULL, '03/01/2026', NULL, '17/01/2026', NULL, 'Chorrillos', '5', 'TELESPAZIO', 'CIC_IGNFI_V2 (5).xlsx'),
('251210003', 'Lote 3A - EXP', 'E02 / IN_01', '3061', '8 y 9', 'V1', 'CIC-3', '03/01/2026', NULL, '03/01/2026', NULL, '17/01/2026', NULL, 'Independencia', '3A', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('251210004', 'Lote 5 - Telespazio', 'E03 / CH_02', '2934', '19', 'V2', 'CIC-10', '14/03/2026', NULL, '19/03/2026', NULL, '28/03/2026', NULL, 'Chorrillos', '5', 'TELESPAZIO', 'CIC_IGNFI_V2 (5).xlsx'),
('251210005', 'Lote 4 - EXP', 'E03 / SM_02', '3067', '11', 'V2', 'CIC-11', '14/03/2026', NULL, '19/03/2026', NULL, '28/03/2026', NULL, 'San Miguel', '4', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('251210006', 'Lote 4 - EXP', 'E05 / EA_02', '2777', '5', 'V2', 'CIC-4', '19/02/2026', NULL, '24/02/2026', NULL, '05/03/2026', NULL, 'El Agustino', '4', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260110001', 'Lote 3B - EXP', 'E03 / CO_01', '3081', '68', 'V1', 'CIC-5', '25/02/2026', NULL, '02/03/2026', NULL, '11/03/2026', NULL, 'Comas', '3B', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260110002', 'Lote 3A - EXP', 'E03 / IN_02', '3054', '9,18 y 19', 'V1', 'CIC-6', '25/02/2026', NULL, '02/03/2026', NULL, '11/03/2026', NULL, 'Independencia', '3A', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260110003', 'Lote 4 - EXP', 'E04 / SM_03', '3008', '11.12', 'V2', 'CIC-22', '16/04/2026', NULL, '21/04/2026', NULL, '30/04/2026', NULL, 'San Miguel', '4', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260110004', 'Lote 4 - EXP', 'E04 / EA_01', '2641', '1', 'V1', 'CIC-4', '19/02/2026', NULL, '24/02/2026', NULL, '05/03/2026', NULL, 'El Agustino', '4', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260110005', 'Lote 6 - ICL-UE003', 'E01 / CL_01', '3130', '20', 'V2', 'CIC-2', '27/03/2026', NULL, '01/04/2026', NULL, '10/04/2026', NULL, 'Cercado de Lima', '6', 'ICL-UE003', 'CIC_IGNFI_V2 (5).xlsx'),
('260110007', 'Lote 5 - Telespazio', 'E04 / SJ_01', '2698', '33', 'V1', 'CIC-7', '27/02/2026', NULL, '03/03/2026', NULL, '12/03/2026', NULL, 'San Juan de Miraflores', '5', 'TELESPAZIO', 'CIC_IGNFI_V2 (5).xlsx'),
('260110008', 'Lote 6 - ICL-UE003', 'E01 / CL_02', '3080', '20', 'V1', 'CIC-1', '11/03/2026', NULL, '16/03/2026', NULL, '25/03/2026', NULL, 'Cercado de Lima', '6', 'ICL-UE003', 'CIC_IGNFI_V2 (5).xlsx'),
('260110009', 'Lote 6 - ICL-UE003', 'E01 / CL_03', '3158', '20', 'V1', 'CIC-1', '11/03/2026', NULL, '16/03/2026', NULL, '25/03/2026', NULL, 'Cercado de Lima', '6', 'ICL-UE003', 'CIC_IGNFI_V2 (5).xlsx'),
('260110010', 'Lote 5 - Telespazio', 'E04 / VS_01', '2714', '7.2', 'V1', 'CIC-9', '07/03/2026', NULL, '12/03/2026', NULL, '21/03/2026', NULL, 'Villa El Salvador', '5', 'TELESPAZIO', 'CIC_IGNFI_V2 (5).xlsx'),
('260210012', 'Lote 3A - EXP', 'E04 / IN_03', '2959', '19.22', 'V1', 'CIC-12', '25/03/2026', NULL, '30/03/2026', NULL, '08/04/2026', NULL, 'Independencia', '3A', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260210013', 'Lote 3B - EXP', 'E04 / CO_02', '2969', '64.69', 'V1', 'CIC-13', '25/03/2026', NULL, '30/03/2026', NULL, '08/04/2026', NULL, 'Comas', '3B', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260210014', 'Lote 5 - Telespazio', 'E04 / CH_03', '3008', '19', 'V1', 'CIC-16', '27/03/2026', NULL, '02/04/2026', NULL, '11/04/2026', NULL, 'Chorrillos', '5', 'TELESPAZIO', 'CIC_IGNFI_V2 (5).xlsx'),
('260210015', 'Lote 3B - EXP', 'E04 / CO_03', '3019', '58.64', 'V1', 'CIC-13', '25/03/2026', NULL, '30/03/2026', NULL, '08/04/2026', NULL, 'Comas', '3B', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260210019', 'Lote 3A - EXP', 'E04 / IN_04', '2941', '19, 25, 27,30', 'V1', 'CIC-8', '05/03/2026', NULL, '10/03/2026', NULL, '19/03/2026', NULL, 'Independencia', '3A', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260210020', 'Lote 4 - EXP', 'E05 / SM_04', '3059', '12', 'V1', 'CIC-11', '14/03/2026', NULL, '19/03/2026', NULL, '28/03/2026', NULL, 'San Miguel', '4', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260210021', 'Lote 4 - EXP', 'E06 / EA_03', '2869', '5', 'V1', 'CIC-21', '11/04/2026', NULL, '16/04/2026', NULL, '25/04/2026', NULL, 'El Agustino', '4', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260210022', 'Lote 4 - EXP', 'E05 / SM_05', '2548', '12.13', 'V1', 'CIC-11', '14/03/2026', NULL, '19/03/2026', NULL, '28/03/2026', NULL, 'San Miguel', '4', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260210023', 'Lote 6 - ICL-UE003', 'E02 / CL_04', '2896', '20', 'V1', 'CIC-2', '27/03/2026', NULL, '01/04/2026', NULL, '10/04/2026', NULL, 'Cercado de Lima', '6', 'ICL-UE003', 'CIC_IGNFI_V2 (5).xlsx'),
('260210024', 'Lote 6 - ICL-UE003', 'E02 / CL_05', '2822', '20', 'V1', 'CIC-2', '27/03/2026', NULL, '01/04/2026', NULL, '10/04/2026', NULL, 'Cercado de Lima', '6', 'ICL-UE003', 'CIC_IGNFI_V2 (5).xlsx'),
('260210025', 'Lote 6 - ICL-UE003', 'E02 / CL_06', '2945', '15', 'V1', 'CIC-2', '27/03/2026', NULL, '01/04/2026', NULL, '10/04/2026', NULL, 'Cercado de Lima', '6', 'ICL-UE003', 'CIC_IGNFI_V2 (5).xlsx'),
('260310027', 'Lote 6 - ICL-UE003', 'E02 / CL_07', '2966', '15', 'V1', 'CIC-2', '27/03/2026', NULL, '01/04/2026', NULL, '10/04/2026', NULL, 'Cercado de Lima', '6', 'ICL-UE003', 'CIC_IGNFI_V2 (5).xlsx'),
('260310028', 'Lote 6 - ICL-UE003', 'E02 / CL_08', '2917', '15, 20', 'V1', 'CIC-2', '27/03/2026', NULL, '01/04/2026', NULL, '10/04/2026', NULL, 'Cercado de Lima', '6', 'ICL-UE003', 'CIC_IGNFI_V2 (5).xlsx'),
('260310030', 'Lote 3C - INSYS', 'E03 / SP_02', '2972', '58.59', 'V2', 'CIC-36', '03/06/2026', NULL, '08/06/2026', NULL, '17/06/2026', NULL, 'San Martin de Porres', '3C', 'INSYS', 'CIC_IGNFI_V2 (5).xlsx'),
('260310031', 'Lote 5 - Telespazio', 'E05 / CH_04', '2884', '19', 'V1', 'CIC-15', '26/03/2026', NULL, '31/03/2026', NULL, '09/04/2026', NULL, 'Chorrillos', '5', 'TELESPAZIO', 'CIC_IGNFI_V2 (5).xlsx'),
('260310032', 'Lote 3C - INSYS', 'E03 / SP_03', '2982', '57.58', 'V2', 'CIC-36', '03/06/2026', NULL, '08/06/2026', NULL, '17/06/2026', NULL, 'San Martin de Porres', '3C', 'INSYS', 'CIC_IGNFI_V2 (5).xlsx'),
('260310033', 'Lote 3C - INSYS', 'E03 / SP_04', '2780', '56,57', 'V1', 'CIC-14', '25/03/2026', NULL, '30/03/2026', NULL, '08/04/2026', NULL, 'San Martin de Porres', '3C', 'INSYS', 'CIC_IGNFI_V2 (5).xlsx'),
('260310036', 'Lote 3A - EXP', 'E05 / IN_05', '3020', '27,28,30,31', 'V1', 'CIC-17', '02/04/2026', NULL, '07/04/2026', NULL, '16/04/2026', NULL, 'Independencia', '3A', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260310037', 'Lote 3B - EXP', 'E05 / CO_04', '3042', '57.58', 'V1', 'CIC-18', '02/04/2026', NULL, '07/04/2026', NULL, '16/04/2026', NULL, 'Comas', '3B', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260310038', 'Lote 3C - INSYS', 'E02 / SP_01', '3090', '59', 'V2', 'CIC-25', '30/04/2026', NULL, '05/05/2026', NULL, '14/05/2026', NULL, 'San Martin de Porres', '3C', 'INSYS', 'CIC_IGNFI_V2 (5).xlsx'),
('260310039', 'Lote 3B - EXP', 'E05 / CO_05', '3082', '56,57,58', 'V1', 'CIC-18', '02/04/2026', NULL, '07/04/2026', NULL, '16/04/2026', NULL, 'Comas', '3B', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260310040', 'Lote 5 - Telespazio', 'E05 / VS_02', '3082', '20,32,33', 'V1', 'CIC-19', '02/04/2026', NULL, '07/04/2026', NULL, '16/04/2026', NULL, 'Villa El Salvador', '5', 'TELESPAZIO', 'CIC_IGNFI_V2 (5).xlsx'),
('260310042', 'Lote 4 - EXP', 'E06 / SM_06', '3021', '13', 'V1', 'CIC-31', '16/05/2026', NULL, '20/05/2026', NULL, '29/05/2026', NULL, 'San Miguel', '4', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260310043', 'Lote 4 - EXP', 'E06 / SM_07', '3027', '10.13', 'V1', 'CIC-20', '11/04/2026', NULL, '16/04/2026', NULL, '25/04/2026', NULL, 'San Miguel', '4', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260310045', 'Lote 4 - EXP', 'E06 / SM_08', '2814', '13', 'V1', 'CIC-20', '11/04/2026', NULL, '16/04/2026', NULL, '25/04/2026', NULL, 'San Miguel', '4', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260310046', 'Lote 4 - EXP', 'E06 / EA_04', '1849', '1, 2, 5', 'V1', 'CIC-32', '16/05/2026', NULL, '20/05/2026', NULL, '29/05/2026', NULL, 'El Agustino', '4', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260310048', 'Lote 5 - Telespazio', 'E05 / SJ_02', '3092', '23,30 Y 33', 'V1', 'CIC-24', '30/04/2026', NULL, '05/05/2026', NULL, '14/05/2026', NULL, 'San Juan de Miraflores', '5', 'TELESPAZIO', 'CIC_IGNFI_V2 (5).xlsx'),
('260310049', 'Lote 5 - Telespazio', 'E05 / CH_05', '2974', '19', 'V1', 'CIC-23', '23/04/2026', NULL, '28/04/2026', NULL, '07/05/2026', NULL, 'Chorrillos', '5', 'TELESPAZIO', 'CIC_IGNFI_V2 (5).xlsx'),
('260310050', 'Lote 6 - ICL-UE003', 'E03 / CL_09', '3038', '18-19', 'V2', 'CIC-3', '06/05/2026', NULL, '11/05/2026', NULL, '20/05/2026', NULL, 'Cercado de Lima', '6', 'ICL-UE003', 'CIC_IGNFI_V2 (5).xlsx'),
('260310051', 'Lote 6 - ICL-UE003', 'E03 / CL_10', '3053', '17-19', 'V2', 'CIC-3', '06/05/2026', NULL, '11/05/2026', NULL, '20/05/2026', NULL, 'Cercado de Lima', '6', 'ICL-UE003', 'CIC_IGNFI_V2 (5).xlsx'),
('260410052', 'Lote 5 - Telespazio', 'E05 / VS_03', '2408', '24.32', 'V1', 'CIC-40', '07/06/2026', NULL, '12/06/2026', NULL, '21/06/2026', NULL, 'Villa El Salvador', '5', 'TELESPAZIO', 'CIC_IGNFI_V2 (5).xlsx'),
('260410053', 'Lote 3C - INSYS', 'E04 / SP_05', '3036', '56', 'V1', 'CIC-39', '06/06/2026', NULL, '11/06/2026', NULL, '20/06/2026', NULL, 'San Martin de Porres', '3C', 'INSYS', 'CIC_IGNFI_V2 (5).xlsx'),
('260410055', 'Lote 3C - INSYS', 'E04 / SP_07', '2977', '54.55', 'V1', 'CIC-39', '06/06/2026', NULL, '11/06/2026', NULL, '20/06/2026', NULL, 'San Martin de Porres', '3C', 'INSYS', 'CIC_IGNFI_V2 (5).xlsx'),
('260410057', 'Lote 3B - EXP', 'E06 / CO_06', '3076', '45.56', 'V1', 'CIC-26', '30/04/2026', NULL, '05/05/2026', NULL, '14/05/2026', NULL, 'Comas', '3B', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260410058', 'Lote 3B - EXP', 'E06 / CO_07', '3063', '45.46', 'V1', 'CIC-26', '30/04/2026', NULL, '05/05/2026', NULL, '14/05/2026', NULL, 'Comas', '3B', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260410059', 'Lote 4 - EXP', 'E07 / SM_09', '3094', '7.8', 'V1', 'CIC-27', '09/05/2026', NULL, '14/05/2026', NULL, '23/05/2026', NULL, 'San Miguel', '4', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260410060', 'Lote 3B - EXP', 'E06 / CO_08', '3084', '33.46', 'V1', 'CIC-29', '09/05/2026', NULL, '14/05/2026', NULL, '23/05/2026', NULL, 'Comas', '3B', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260410062', 'Lote 4 - EXP', 'E07 / EA_06', '4443', '15', 'V1', 'CIC-28', '09/05/2026', NULL, '14/05/2026', NULL, '23/05/2026', NULL, 'El Agustino', '4', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260410063', 'Lote 4 - EXP', 'E06 / EA_07', '3019', '7.13', 'V1', 'CIC-41', '12/06/2026', NULL, '16/06/2026', NULL, '25/06/2026', NULL, 'El Agustino', '4', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260410064', 'Lote 4 - EXP', 'E07 / SM_10', '3044', '10', 'V1', 'CIC-42', '12/06/2026', NULL, '16/06/2026', NULL, '25/06/2026', NULL, 'San Miguel', '4', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260410066', 'Lote 4 - EXP', 'E07 / SM_11', '3081', NULL, 'V1', 'CIC-42', '12/06/2026', NULL, '16/06/2026', NULL, '25/06/2026', NULL, 'San Miguel', '4', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260410067', 'Lote 5 - Telespazio', 'E06 / VS_05', '2585', '19,24,25', 'V1', 'CIC-45', NULL, NULL, NULL, NULL, NULL, NULL, 'Villa El Salvador', '5', 'TELESPAZIO', 'CIC_IGNFI_V2 (5).xlsx'),
('260410068', 'Lote 3A - EXP', 'E06 / IN_06', '2867', '30,38, 39', 'V1', 'CIC-30', '09/05/2026', NULL, '14/05/2026', NULL, '23/05/2026', NULL, 'Independencia', '3A', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260410071', 'Lote 5 - Telespazio', 'E06 / SJ_04', '2415', '31.32', 'V1', 'CIC-43', '23/06/2026', NULL, '28/06/2026', NULL, '07/07/2026', NULL, 'San Juan de Miraflores', '5', 'TELESPAZIO', 'CIC_IGNFI_V2 (5).xlsx'),
('260410072', 'Lote 5 - Telespazio', 'E06 / CH_06', '2585', '19', 'V1', 'CIC-44', NULL, NULL, NULL, NULL, NULL, NULL, 'Chorrillos', '5', 'TELESPAZIO', 'CIC_IGNFI_V2 (5).xlsx'),
('260410076', 'Lote 5 - Telespazio', 'E06 / VS_06', '2516', '11,17,18', 'V1', 'CIC-34', '30/05/2026', NULL, '04/06/2026', NULL, '13/06/2026', NULL, 'Villa El Salvador', '5', 'TELESPAZIO', 'CIC_IGNFI_V2 (5).xlsx'),
('260510077', 'Lote 3B - EXP', 'E07 / CO_09', '2933', '32.33', 'V1', 'CIC-33', '29/05/2026', NULL, '03/06/2026', NULL, '12/06/2026', NULL, 'Comas', '3B', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260510078', 'Lote 3C - INSYS', 'E05 / SP_08', '3109', '43.54', 'V1', 'CIC-35', '30/05/2026', NULL, '04/06/2026', NULL, '13/06/2026', NULL, 'San Martin de Porres', '3C', 'INSYS', 'CIC_IGNFI_V2 (5).xlsx'),
('260510080', 'Lote 3C - INSYS', 'E05 / SP_10', '2775', '43.44', 'V1', 'CIC-35', '30/05/2026', NULL, '04/06/2026', NULL, '13/06/2026', NULL, 'San Martin de Porres', '3C', 'INSYS', 'CIC_IGNFI_V2 (5).xlsx'),
('260510081', 'Lote 3B - EXP', 'E07 / CO_10', '2917', '22,23,33', 'V1', 'CIC-37', '05/06/2026', NULL, '10/06/2026', NULL, '19/06/2026', NULL, 'Comas', '3B', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260510083', 'Lote 3A - EXP', 'E07 / IN_07', '3079', '28,29,30,31,32,33,34', 'V1', 'CIC-38', '05/06/2026', NULL, '10/06/2026', NULL, '19/06/2026', NULL, 'Independencia', '3A', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260510084', 'Lote 3B - EXP', 'E07 / CO_11', '2912', '22,23,24', 'V1', 'CIC-37', '05/06/2026', NULL, '10/06/2026', NULL, '19/06/2026', NULL, 'Comas', '3B', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260510086', 'Lote 3B - EXP', 'E07 / CO_12', '2987', '45', 'V1', 'CIC-37', '05/06/2026', NULL, '10/06/2026', NULL, '19/06/2026', NULL, 'Comas', '3B', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260510087', 'Lote 4 - EXP', 'E08 / SM_12', '3004', '9', 'V1', 'CIC-42', '12/06/2026', NULL, '16/06/2026', NULL, '25/06/2026', NULL, 'San Miguel', '4', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260510088', 'Lote 4 - EXP', 'E08 / SM_13', '4254', '9', 'V1', 'CIC-42', '12/06/2026', NULL, '16/06/2026', NULL, '25/06/2026', NULL, 'San Miguel', '4', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260510089', 'Lote 4 - EXP', 'E08 / EA_09', '3002', '04,06,09,10', 'V1', 'CIC-41', '12/06/2026', NULL, '16/06/2026', NULL, '25/06/2026', NULL, 'El Agustino', '4', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260510090', 'Lote 4 - EXP', 'E08 / EA_10', '3092', '6', 'V1', 'CIC-41', '12/06/2026', NULL, '16/06/2026', NULL, '25/06/2026', NULL, 'El Agustino', '4', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260510091', 'Lote 4 - EXP', 'E08 / EA_11', '3145', '7.11', 'V1', 'CIC-41', '12/06/2026', NULL, '16/06/2026', NULL, '25/06/2026', NULL, 'El Agustino', '4', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260510092', 'Lote 4 - EXP', 'E08 / SM_14', '3227', '7', 'V1', 'CIC-42', '12/06/2026', NULL, '16/06/2026', NULL, '25/06/2026', NULL, 'San Miguel', '4', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260510093', 'Lote 4 - EXP', 'E08 / SM_15', '2549', '7.9', 'V1', 'CIC-42', '12/06/2026', NULL, '16/06/2026', NULL, '25/06/2026', NULL, 'San Miguel', '4', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260510101', 'Lote 3A - EXP', 'E09 / IN_08', '3031', '39,40,42', 'V1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Independencia', '3A', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260610106', 'Lote 3B - EXP', 'E08 / CO_14', '2999', '16.24', 'V1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Comas', '3B', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260610108', 'Lote 3B - EXP', 'E08 / CO_15', '3105', '16.15', 'V1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Comas', '3B', 'EXP', 'CIC_IGNFI_V2 (5).xlsx'),
('260610109', 'Lote 3C - INSYS', 'E05 / SP_11', '2921', '40,44,46', 'V1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'San Martin de Porres', '3C', 'INSYS', 'CIC_IGNFI_V2 (5).xlsx'),
('260610114', 'Lote 3B - EXP', 'E08 / CO_16', '3022', '14.15', 'V1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Comas', '3B', 'EXP', 'CIC_IGNFI_V2 (5).xlsx')
ON CONFLICT (codigo_poligono) DO UPDATE SET
  lote_empresa = EXCLUDED.lote_empresa,
  entregable_cod_ign_fi = EXCLUDED.entregable_cod_ign_fi,
  unidades_catastrales = EXCLUDED.unidades_catastrales,
  sector = EXCLUDED.sector,
  version = EXCLUDED.version,
  n_cic = EXCLUDED.n_cic,
  cic_difusion = EXCLUDED.cic_difusion,
  fotografias_difusion = EXCLUDED.fotografias_difusion,
  cic_inicio = EXCLUDED.cic_inicio,
  fotografias_inicio = EXCLUDED.fotografias_inicio,
  cic_cierre = EXCLUDED.cic_cierre,
  fotografias_cierre = EXCLUDED.fotografias_cierre,
  distrito_oficial = EXCLUDED.distrito_oficial,
  lote_oficial = EXCLUDED.lote_oficial,
  empresa_oficial = EXCLUDED.empresa_oficial,
  fuente_oficial = EXCLUDED.fuente_oficial,
  actualizado_en = now();

-- Vista recomendada para publicar/consultar con geometría + datos oficiales.
CREATE OR REPLACE VIEW public.vw_tg_poligono_cic_oficial AS
SELECT
  p.*,
  i.lote_empresa,
  i.entregable_cod_ign_fi,
  i.unidades_catastrales,
  i.sector AS sector_cic,
  i.version AS version_cic,
  i.n_cic,
  i.cic_difusion,
  i.fotografias_difusion,
  i.cic_inicio,
  i.fotografias_inicio,
  i.cic_cierre,
  i.fotografias_cierre,
  i.distrito_oficial,
  i.lote_oficial,
  i.empresa_oficial,
  i.fuente_oficial
FROM public.tg_poligono p
LEFT JOIN public.tg_poligono_cic_info i
  ON p.codigo_poligono::text = i.codigo_poligono;

-- Control 1: códigos oficiales que no existen en la geometría public.tg_poligono.
SELECT i.codigo_poligono, i.distrito_oficial, i.lote_empresa, i.n_cic
FROM public.tg_poligono_cic_info i
LEFT JOIN public.tg_poligono p ON p.codigo_poligono::text = i.codigo_poligono
WHERE p.codigo_poligono IS NULL
ORDER BY i.codigo_poligono;

-- Control 2: polígonos gráficos sin información oficial CIC.
SELECT p.codigo_poligono::text AS codigo_poligono, p.ubigeo
FROM public.tg_poligono p
LEFT JOIN public.tg_poligono_cic_info i ON p.codigo_poligono::text = i.codigo_poligono
WHERE i.codigo_poligono IS NULL
ORDER BY p.codigo_poligono::text;
