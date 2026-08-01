import katex from 'katex';
import { 
  EducationalBookProject, 
  EducationalPage, 
  MathProblem, 
  WordPuzzleItem, 
  ColoringElement, 
  FolktaleData, 
  CommunityProjectData, 
  IndigenousLanguageData,
  PastExamPaperData,
  RevisionTestData,
  CadDraftingData,
  ThreeDPrintingData
} from './types';

/**
 * Generate official ZIMSEC Past Examination Paper layout data
 */
export function generatePastExamPaper(
  subjectName: string = 'Combined Science',
  gradeOrLevel: string = 'ZIMSEC O-Level',
  paperNumber: number = 1
): PastExamPaperData {
  const isPrimary = gradeOrLevel.toLowerCase().includes('primary') || gradeOrLevel.toLowerCase().includes('grade');
  const codePrefix = subjectName.toUpperCase().includes('MATH') ? '4004' :
                     subjectName.toUpperCase().includes('SCIENCE') ? '5006' :
                     subjectName.toUpperCase().includes('HERITAGE') ? '4006' :
                     subjectName.toUpperCase().includes('SHONA') ? '3006' :
                     subjectName.toUpperCase().includes('AGRIC') ? '7038' : '2042';

  if (paperNumber === 1) {
    return {
      examSession: `ZIMSEC NOVEMBER 2025 ${gradeOrLevel.toUpperCase()} EXAMINATION`,
      subjectCode: `${subjectName.toUpperCase()} ${codePrefix}/1`,
      paperNumber: 1,
      timeAllowed: isPrimary ? '1 Hour 30 Minutes' : '1 Hour 45 Minutes',
      totalMarks: 40,
      instructionsToCandidates: [
        'Read the instructions on the answer sheet provided carefully.',
        'Answer ALL forty questions in this paper.',
        'Choose ONE correct option (A, B, C or D) for each question.',
        'Calculators and Mathematical Tables may be used where applicable.'
      ],
      sections: [
        {
          sectionName: 'SECTION A: MULTIPLE CHOICE QUESTIONS (40 MARKS)',
          instructions: 'Select the single best answer for each question.',
          questions: [
            {
              id: 'pe-q1',
              questionNumber: '1',
              questionText: 'Which unit of measurement is internationally accepted for mass in scientific experiments?',
              marks: 1,
              type: 'multiple_choice',
              options: ['A) Kilogram (kg)', 'B) Metre (m)', 'C) Newton (N)', 'D) Joule (J)'],
              correctAnswer: 'A',
              markingGuide: 'A - Kilogram is the SI unit of mass.'
            },
            {
              id: 'pe-q2',
              questionNumber: '2',
              questionText: 'What is the primary ecological benefit of Pfumvudza / Intwasa conservation tillage in Zimbabwe?',
              marks: 1,
              type: 'multiple_choice',
              options: ['A) Increasing soil compaction', 'B) Soil moisture retention and erosion prevention', 'C) Heavy chemical usage', 'D) Water evaporation'],
              correctAnswer: 'B',
              markingGuide: 'B - Mulch cover traps soil moisture.'
            },
            {
              id: 'pe-q3',
              questionNumber: '3',
              questionText: 'In the ZIMSEC Heritage syllabus, Great Zimbabwe Monument dry stone walls were constructed using:',
              marks: 1,
              type: 'multiple_choice',
              options: ['A) Mortar and cement', 'B) Dressed granite blocks without mortar', 'C) Mud bricks and thatch', 'D) Iron rebar'],
              correctAnswer: 'B',
              markingGuide: 'B - Dry stonemasonry technique without mortar.'
            },
            {
              id: 'pe-q4',
              questionNumber: '4',
              questionText: 'Which gas is taken in during plant photosynthesis to synthesize glucose?',
              marks: 1,
              type: 'multiple_choice',
              options: ['A) Oxygen', 'B) Carbon Dioxide (CO2)', 'C) Nitrogen', 'D) Helium'],
              correctAnswer: 'B',
              markingGuide: 'B - Carbon dioxide is absorbed via stomata.'
            }
          ]
        }
      ]
    };
  } else {
    return {
      examSession: `ZIMSEC NOVEMBER 2025 ${gradeOrLevel.toUpperCase()} EXAMINATION`,
      subjectCode: `${subjectName.toUpperCase()} ${codePrefix}/2`,
      paperNumber: 2,
      timeAllowed: '2 Hours 30 Minutes',
      totalMarks: 100,
      instructionsToCandidates: [
        'Write your Name, Centre Number, and Candidate Number in the spaces provided.',
        'Answer ALL questions in Section A and ANY THREE questions from Section B.',
        'Write your answers in the spaces provided on the question paper.',
        'Show all working out clearly for calculation questions.'
      ],
      sections: [
        {
          sectionName: 'SECTION A: STRUCTURED SHORT-ANSWER QUESTIONS (60 MARKS)',
          instructions: 'Answer all questions in the space provided below each item.',
          questions: [
            {
              id: 'pe2-q1',
              questionNumber: '1(a)',
              questionText: 'Define the term Hunhu / Ubuntu as applied in African cultural ethics and community living.',
              marks: 4,
              type: 'short_answer',
              sampleAnswer: 'Hunhu/Ubuntu is a philosophical framework emphasizing moral integrity, respect for elders, community solidarity ("I am because we are"), and mutual care.'
            },
            {
              id: 'pe2-q2',
              questionNumber: '1(b)',
              questionText: 'Calculate the volume of a rectangular Pfumvudza basin measuring 15 cm length, 15 cm width, and 15 cm depth.',
              marks: 4,
              type: 'calculation',
              sampleAnswer: 'Volume = L x W x H = 15 cm x 15 cm x 15 cm = 3375 cm³ (or 3.375 Litres).'
            }
          ]
        },
        {
          sectionName: 'SECTION B: ESSAY & DATA ANALYSIS QUESTIONS (40 MARKS)',
          instructions: 'Answer any two questions in this section.',
          questions: [
            {
              id: 'pe2-q3',
              questionNumber: '3',
              questionText: 'Evaluate the role of Indigenous Knowledge Systems (IKS) in climate forecasting and traditional medicine in Zimbabwe.',
              marks: 20,
              type: 'essay',
              sampleAnswer: 'Candidates should discuss: 1) Observation of animal behaviors and flora blooming for rain prediction. 2) Traditional herbal medicine (e.g. Zumbani). 3) Soil conservation.'
            }
          ]
        }
      ]
    };
  }
}

/**
 * Generate structured ZIMSEC Revision Test & Practice Assessment Paper
 */
export function generateRevisionTest(
  subjectName: string = 'General Academic Revision',
  topicName: string = 'End of Term Assessment'
): RevisionTestData {
  return {
    testTitle: `${subjectName}: ${topicName} Revision Test`,
    syllabusTopic: topicName,
    timeLimitMinutes: 45,
    totalPoints: 30,
    instructions: 'Answer all questions independently within the 45-minute time limit. Use neat handwriting.',
    questions: [
      {
        id: 'rev-q1',
        questionNum: 1,
        question: 'Explain two reasons why soil mulching is essential in crop production.',
        maxPoints: 4,
        answerSpaceLines: 4,
        sampleAnswer: '1) Reduces moisture evaporation from the soil. 2) Suppresses weed growth and moderates soil temperature.'
      },
      {
        id: 'rev-q2',
        questionNum: 2,
        question: 'Solve the equation: 4x + 12 = 36. Show all working.',
        maxPoints: 4,
        answerSpaceLines: 3,
        sampleAnswer: '4x = 36 - 12 => 4x = 24 => x = 6.'
      },
      {
        id: 'rev-q3',
        questionNum: 3,
        question: 'Write down the meaning of the Shona proverb: "Kure kwagava ndokusina mukubvu".',
        maxPoints: 4,
        answerSpaceLines: 3,
        sampleAnswer: 'A person will travel any distance to reach a place where they know there is something valuable or beneficial.'
      },
      {
        id: 'rev-q4',
        questionNum: 4,
        question: 'List three historical features of the Great Enclosure at Great Zimbabwe.',
        maxPoints: 6,
        answerSpaceLines: 5,
        sampleAnswer: '1) Dry stonemasonry walls without mortar. 2) Conical Tower standing 10 meters high. 3) Chevron pattern along the outer wall upper rim.'
      }
    ]
  };
}

/**
 * Generate ArchiCAD & FreeCAD CAD Drafting & Architectural Blueprint Data
 */
export function generateCadDraftingData(
  software: 'ArchiCAD' | 'FreeCAD' | 'Generic CAD' = 'ArchiCAD',
  draftingType: 'architectural_floorplan' | 'orthographic_projection' | 'parametric_3d_component' | 'bim_wall_section' = 'architectural_floorplan'
): CadDraftingData {
  if (software === 'ArchiCAD') {
    return {
      software: 'ArchiCAD',
      draftingType,
      title: draftingType === 'architectural_floorplan' ? 'Residential House Architectural Blueprint & Dimensioning' : 'ArchiCAD Composite Wall Section & BIM Detailing',
      scale: '1:50',
      projectUnits: 'mm',
      blueprintSvgKey: draftingType === 'architectural_floorplan' ? 'floorplan_residential' : 'archicad_wall_detail',
      dimensions: [
        { label: 'Overall Living Room Length', value: '5500 mm' },
        { label: 'External Masonry Wall Thickness', value: '230 mm' },
        { label: 'Internal Partition Wall Thickness', value: '115 mm' },
        { label: 'Standard Window Width (W1)', value: '1200 mm' },
        { label: 'Single Door Clearance (D1)', value: '900 mm' }
      ],
      layerSpecifications: [
        { layerName: 'A-WALL-EXTR', lineWeight: '0.35 mm', colorHex: '#1e293b', description: 'External Load-bearing Brickwork' },
        { layerName: 'A-DIMS-LINR', lineWeight: '0.18 mm', colorHex: '#2563eb', description: 'Linear Dimension Lines & Tick Marks' },
        { layerName: 'A-DOOR-OPEN', lineWeight: '0.25 mm', colorHex: '#059669', description: 'Door Frames & 90° Swing Arc' },
        { layerName: 'A-[ANNO-TEXT]', lineWeight: '0.25 mm', colorHex: '#7c3aed', description: 'Room Name & Floor Level Annotations' }
      ],
      exerciseTasks: [
        {
          taskNumber: 1,
          instruction: 'Calculate the net usable floor area of the Living Room given overall dimensions 5.50m x 4.20m.',
          maxPoints: 4,
          sampleSolution: 'Area = Length x Width = 5.50m x 4.20m = 23.10 m².'
        },
        {
          taskNumber: 2,
          instruction: 'In ArchiCAD 27, explain how to set up the Stories & Elevation levels for a single-story residence with 2800mm ceiling height.',
          maxPoints: 5,
          sampleSolution: 'Right-click Story Settings (Ctrl+7) -> Set Ground Floor height to 0.00mm, Story 1 to +3000mm. Adjust wall top-link constraints to Ground Floor + 2800mm.'
        },
        {
          taskNumber: 3,
          instruction: 'Identify three key BIM parameters associated with the GDL Door object in ArchiCAD (e.g. casing, sill height, fire rating).',
          maxPoints: 6,
          sampleSolution: '1) Nominal W/H sizes (900x2100mm). 2) Wall Sill/Header Offset (+0mm). 3) Thermal Transmittance U-value & Fire Resistance Rating.'
        }
      ]
    };
  } else {
    // FreeCAD Parametric Modeling
    return {
      software: 'FreeCAD',
      draftingType: draftingType === 'orthographic_projection' ? 'orthographic_projection' : 'parametric_3d_component',
      title: 'FreeCAD PartDesign Workbench: Parametric Solid Modeling & Orthographic Views',
      scale: '1:1 (mm)',
      projectUnits: 'mm',
      blueprintSvgKey: draftingType === 'orthographic_projection' ? 'orthographic_cube_bracket' : 'freecad_part_design',
      dimensions: [
        { label: 'Base Bracket Length (X)', value: '80 mm' },
        { label: 'Base Bracket Width (Y)', value: '50 mm' },
        { label: 'Base Plate Thickness (Z)', value: '12 mm' },
        { label: 'Bore Hole Diameter (D)', value: '16 mm' },
        { label: 'Fillet Radius (R)', value: '5 mm' }
      ],
      layerSpecifications: [
        { layerName: 'PartDesign_Body', lineWeight: 'Solid Model', colorHex: '#0284c7', description: 'Active Parametric Body' },
        { layerName: 'Sketch_Constraints', lineWeight: '0.25 mm', colorHex: '#e11d48', description: 'Coincident, Distance & Equality Constraints' },
        { layerName: 'TechDraw_View', lineWeight: '0.35 mm', colorHex: '#0f172a', description: 'Technical Drawing Projection Lines' }
      ],
      exerciseTasks: [
        {
          taskNumber: 1,
          instruction: 'List the step-by-step procedure in FreeCAD PartDesign Workbench to create a 3D solid body with a centered bore hole.',
          maxPoints: 5,
          sampleSolution: '1) Create Body -> Create Sketch on XY Plane. 2) Draw 80x50mm rectangle, pad to 12mm thickness. 3) Create new sketch on top face, draw circle D16mm, apply Hole/Pocket tool through-all.'
        },
        {
          taskNumber: 2,
          instruction: 'Explain why fully constraining a sketch (changing line color from white to green in FreeCAD Sketcher) is mandatory before applying a Pad or Revolution.',
          maxPoints: 5,
          sampleSolution: 'Fully constrained sketches eliminate geometric ambiguity, ensuring parametric edits or dimensions propagate predictably without breaking model topology.'
        },
        {
          taskNumber: 3,
          instruction: 'Using First-Angle Orthographic Projection, sketch or describe the Front, Top, and Right Side views of the bracket component.',
          maxPoints: 6,
          sampleSolution: 'Front View shows 80x12mm base plate with vertical flange. Top View shows 80x50mm rectangle with hidden lines for bore holes. Right Side View shows 50mm profile.'
        }
      ]
    };
  }
}

/**
 * Generate 3D Printing Dynamics & Additive Manufacturing Data
 */
export function generateThreeDPrintingData(
  printerTechnology: 'FDM' | 'SLA' | 'SLS' = 'FDM',
  topic: 'slicing_parameters' | 'filament_dynamics' | 'gcode_syntax' | 'infill_and_supports' | 'print_troubleshooting' = 'slicing_parameters'
): ThreeDPrintingData {
  return {
    printerTechnology,
    topic,
    filamentType: printerTechnology === 'SLA' ? 'Photopolymer Resin' : 'PLA',
    slicerSettings: {
      layerHeightMm: 0.2,
      nozzleTempC: printerTechnology === 'SLA' ? 25 : 210,
      bedTempC: printerTechnology === 'SLA' ? 0 : 60,
      printSpeedMmS: printerTechnology === 'SLA' ? 30 : 60,
      infillDensityPercent: 20,
      infillPattern: 'Gyroid',
      supportOverhangAngleDeg: 45,
      retractionDistanceMm: 5.0
    },
    gcodeSnippet: [
      { lineNum: 1, code: 'G28', explanation: 'Auto Home all axes (X, Y, Z limit switches)' },
      { lineNum: 2, code: 'M104 S210', explanation: 'Set nozzle hotend target temperature to 210°C (Non-blocking)' },
      { lineNum: 3, code: 'M190 S60', explanation: 'Set bed temperature to 60°C and wait until target reached' },
      { lineNum: 4, code: 'G92 E0', explanation: 'Reset extrusion distance accumulator to 0.0mm' },
      { lineNum: 5, code: 'G1 X10.0 Y20.0 Z0.2 F1500.0 E1.5', explanation: 'Move nozzle to X=10, Y=20 at Z=0.2mm layer height while extruding 1.5mm filament' }
    ],
    troubleshootingCases: [
      {
        faultName: 'Filament Stringing & Oozing',
        symptom: 'Fine hair-like plastic threads stretching across open gaps between printed parts.',
        cause: 'Insufficient retraction distance/speed or hotend temperature too high, causing molten plastic to drip during travel moves.',
        solution: 'Increase retraction length (e.g. 5-7mm for Bowden tube) and lower nozzle temperature by 5-10°C.'
      },
      {
        faultName: 'Print Bed Unwarping / Corner Lifting',
        symptom: 'Bottom corners of the printed model lift off the build plate and curl upwards during printing.',
        cause: 'Poor bed adhesion and thermal contraction stress in PLA/ABS as upper layers cool faster than bottom layers.',
        solution: 'Re-level heatbed with A4 paper gap, clean bed with Isopropyl Alcohol (IPA), use glue stick/PEI sheet, and set bed temp to 60°C.'
      }
    ],
    exerciseQuestions: [
      {
        id: 'tdp-q1',
        questionNum: 1,
        question: 'Calculate the total volume of PLA filament (1.75mm diameter) required to print a cubic model of volume 40 cm³ sliced at 20% Gyroid infill density with 1.2mm shell walls.',
        points: 5,
        sampleAnswer: 'Est. Solid Volume = Shells (~10 cm³) + Infill (30 cm³ x 0.20 = 6 cm³) = 16 cm³. Filament Cross-section area = π x (1.75/2)² = 2.405 mm². Length needed = 16,000 / 2.405 = 6,652 mm (6.65 meters).'
      },
      {
        id: 'tdp-q2',
        questionNum: 2,
        question: 'Explain the functional advantage of a Gyroid infill pattern over standard Grid infill in FDM 3D printing dynamics.',
        points: 4,
        sampleAnswer: 'Gyroid provides isotropic (equal strength in X, Y, Z directions) structural integrity with optimal strength-to-weight ratio and continuous non-crossing nozzle path motion, preventing nozzle collisions.'
      },
      {
        id: 'tdp-q3',
        questionNum: 3,
        question: 'Analyze the G-code command "G1 Z0.4 F300". Describe the movement executed by the 3D printer stepper motors.',
        points: 3,
        sampleAnswer: 'The command instructs the Z-axis stepper motor to move the hotend/bed linearly to height 0.4 mm at a feedrate speed of 300 mm/min (5 mm/s).'
      }
    ]
  };
}

/**
 * Generate Math Problems appropriate for grade levels using LaTeX notation
 */
export function generateMathProblems(
  category: 'addition' | 'multiplication' | 'fractions' | 'geometry' | 'algebra',
  count: number = 8
): MathProblem[] {
  const problems: MathProblem[] = [];

  for (let i = 1; i <= count; i++) {
    let q = '';
    let expr = '';
    let ans = '';

    if (category === 'addition') {
      const a = Math.floor(Math.random() * 45) + 12;
      const b = Math.floor(Math.random() * 45) + 12;
      q = `Calculate the sum of ${a} and ${b}`;
      expr = `${a} + ${b} = \\square`;
      ans = `${a + b}`;
    } else if (category === 'multiplication') {
      const a = Math.floor(Math.random() * 11) + 2;
      const b = Math.floor(Math.random() * 11) + 2;
      q = `Multiply ${a} \\times ${b}`;
      expr = `${a} \\times ${b} = \\square`;
      ans = `${a * b}`;
    } else if (category === 'fractions') {
      const denom = [2, 3, 4, 5, 6, 8, 10][Math.floor(Math.random() * 7)];
      const num1 = Math.floor(Math.random() * (denom - 1)) + 1;
      const num2 = Math.floor(Math.random() * (denom - 1)) + 1;
      q = `Add the fractions with like denominators`;
      expr = `\\frac{${num1}}{${denom}} + \\frac{${num2}}{${denom}} = \\square`;
      ans = `${num1 + num2}/${denom}`;
    } else if (category === 'geometry') {
      const w = Math.floor(Math.random() * 8) + 3;
      const h = Math.floor(Math.random() * 8) + 3;
      q = `Find the area of a rectangle with length ${w}cm and width ${h}cm`;
      expr = `\\text{Area} = ${w}\\,\\text{cm} \\times ${h}\\,\\text{cm} = \\square\\,\\text{cm}^2`;
      ans = `${w * h}`;
    } else {
      // Algebra
      const x = Math.floor(Math.random() * 10) + 1;
      const coef = Math.floor(Math.random() * 5) + 2;
      const offset = Math.floor(Math.random() * 8) + 1;
      const total = coef * x + offset;
      q = `Solve the algebraic equation for variable x`;
      expr = `${coef}x + ${offset} = ${total} \\implies x = \\square`;
      ans = `${x}`;
    }

    problems.push({
      id: `math-${i}-${Date.now()}`,
      question: q,
      expression: expr,
      latex: expr,
      answer: ans,
      visualItemsCount: category === 'addition' ? parseInt(ans) : undefined,
    });
  }

  return problems;
}

/**
 * Word Search Grid Generator
 */
export function generateWordSearchGrid(words: string[], size: number = 10): string[][] {
  const grid: string[][] = Array(size).fill(null).map(() => Array(size).fill(''));
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  // Place each word horizontally or vertically if possible
  words.forEach(rawWord => {
    const word = rawWord.toUpperCase().replace(/[^A-Z]/g, '');
    if (!word || word.length > size) return;

    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 50) {
      attempts++;
      const isHorizontal = Math.random() > 0.5;
      const row = Math.floor(Math.random() * (isHorizontal ? size : size - word.length + 1));
      const col = Math.floor(Math.random() * (isHorizontal ? size - word.length + 1 : size));

      // Check collision
      let fits = true;
      for (let i = 0; i < word.length; i++) {
        const r = isHorizontal ? row : row + i;
        const c = isHorizontal ? col + i : col;
        if (grid[r][c] !== '' && grid[r][c] !== word[i]) {
          fits = false;
          break;
        }
      }

      if (fits) {
        for (let i = 0; i < word.length; i++) {
          const r = isHorizontal ? row : row + i;
          const c = isHorizontal ? col + i : col;
          grid[r][c] = word[i];
        }
        placed = true;
      }
    }
  });

  // Fill empty spaces
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }
  }

  return grid;
}

/**
 * Generate African Folktale & Oral Tradition Activity Page Data
 */
export function generateFolktaleData(theme: 'tsuro_na_gudo' | 'kamba_tortoise' | 'great_zimbabwe' | 'pfumvudza_farm'): FolktaleData {
  if (theme === 'tsuro_na_gudo') {
    return {
      title: 'Tsuro naGudo (The Hare and the Baboon)',
      cultureOrigin: 'Shona Folk Legend (Ngano) / Ndebele Inganekwane',
      storyText: `Long ago, during a severe drought, Tsuro (the clever Hare) and Gudo (the greedy Baboon) decided to farm together near the riverbank. When harvest time arrived, Gudo ate all the sweet groundnuts by night and blamed the birds. Tsuro set a clever trap using honey on a flat stone. Gudo could not resist and got stuck! Through this ordeal, Gudo learned that honesty and sharing in times of scarcity sustain the community.`,
      moralLesson: `Honesty, hard work, and sharing are the true foundations of Hunhu/Ubuntu in our community.`,
      proverbs: [
        { proverb: 'Kure kwaguduru ndokunorwa mhepo.', meaning: 'Great rewards come after perseverance and unity.', language: 'Shona' },
        { proverb: 'Ukuhamba kubona okunengi.', meaning: 'Traveling and learning brings wisdom.', language: 'Ndebele' }
      ],
      comprehensionQuestions: [
        { id: 'fq1', question: 'Why did Tsuro and Gudo decide to farm together?', sampleAnswer: 'To survive the drought and share the harvest as a community.' },
        { id: 'fq2', question: 'What moral lesson does this story teach us about Hunhu/Ubuntu?', sampleAnswer: 'It teaches honesty, hard work, and that greed harms community relationships.' }
      ],
      illustrationTheme: 'tsuro_na_gudo'
    };
  } else if (theme === 'kamba_tortoise') {
    return {
      title: 'The Wisdom of Kamba the Tortoise & The Great Baobab',
      cultureOrigin: 'Zimbabwean Oral Folklore',
      storyText: `In the ancient land of Matobo Hills, the animals gathered under the Great Baobab Tree to solve a water shortage. While the fast Leopard and strong Elephant tried to dig with speed, they gave up quickly. Kamba the Tortoise worked patiently every day, digging step-by-step with steady determination until clear spring water bubbled up for all the village animals to drink.`,
      moralLesson: `Patience, steady perseverance, and quiet dedication accomplish what brute force cannot.`,
      proverbs: [
        { proverb: 'Aruka anovaka musha nechenjera.', meaning: 'A wise person builds a peaceful community with patience.', language: 'Shona' },
        { proverb: 'Indlela ibuzwa kwabambili.', meaning: 'Wisdom is found through consulting others and persevering.', language: 'Ndebele' }
      ],
      comprehensionQuestions: [
        { id: 'kq1', question: 'Where did the animals gather to solve the water problem?', sampleAnswer: 'Under the Great Baobab Tree in Matobo Hills.' },
        { id: 'kq2', question: 'How did Kamba the Tortoise succeed where stronger animals failed?', sampleAnswer: 'Through steady, patient determination and never giving up.' }
      ],
      illustrationTheme: 'kamba_tortoise'
    };
  } else {
    return {
      title: 'Monuments of Stone: The Builders of Great Zimbabwe',
      cultureOrigin: 'ZIMSEC Heritage & Indigenous Knowledge Systems (IKS)',
      storyText: `Over 800 years ago, skilled stonemasons built Great Zimbabwe without using mortar. They carved granite stones into fitting blocks to form the Great Enclosure wall and the Conical Tower. The site was a bustling trade capital known for gold, ironwork, and cattle rearing. The soapstone Zimbabwe Birds carved atop stone pillars symbolize majesty, peace, and spiritual heritage.`,
      moralLesson: `Respecting our heritage landmarks inspires pride, unity, and excellence in engineering and art.`,
      proverbs: [
        { proverb: 'Mhosva inoreva wani, dzimba dzinovakwa nemabwe.', meaning: 'Strong foundations endure for generations.', language: 'Shona' },
        { proverb: 'Umuntu ngumuntu ngabantu.', meaning: 'A person is a person through other people (Ubuntu).', language: 'Ndebele' }
      ],
      comprehensionQuestions: [
        { id: 'zq1', question: 'What unique architectural feature characterizes Great Zimbabwe?', sampleAnswer: 'Dry stone walls built with dry-fitted granite without mortar.' },
        { id: 'zq2', question: 'What does the Zimbabwe Bird carved from soapstone symbolize?', sampleAnswer: 'Majesty, peace, statehood, and national heritage.' }
      ],
      illustrationTheme: 'great_zimbabwe'
    };
  }
}

/**
 * Generate ZIMSEC Community-Based Field Project Data
 */
export function generateCommunityProjectData(topic: 'pfumvudza_farming' | 'heritage_monuments' | 'indigenous_herbs' | 'clean_water_sanitation' | 'ubuntu_elderly_care'): CommunityProjectData {
  if (topic === 'pfumvudza_farming') {
    return {
      projectName: 'Pfumvudza / Intwasa Climate-Smart Conservation Agriculture Plot',
      zimsecSyllabusCode: 'ZIMSEC Agriculture Syllabus 7038 / Primary Agriculture Grade 6',
      communityTopic: 'pfumvudza_farming',
      objectives: [
        'Demonstrate soil moisture conservation using organic mulching (Mashangazhi)',
        'Calculate planting basin dimensions (15cm x 15cm x 15cm) and spacing',
        'Record crop yield comparisons between traditional tillage and Pfumvudza plots'
      ],
      requiredMaterials: ['Tape measure / Measuring stick', 'Hoe / Digging tool', 'Dry grass / Leaves for mulching', 'Compost or organic manure'],
      fieldSteps: [
        'Step 1: Measure a standard 1.5m x 1.0m demonstration bed in your school or homestead garden.',
        'Step 2: Dig planting basins precisely 15cm deep spaced at 60cm between rows.',
        'Step 3: Add 1 handful of organic compost into each basin and cover with 2cm soil layer.',
        'Step 4: Lay dry grass mulch across the soil surface to trap rainwater and prevent evaporation.',
        'Step 5: Record weekly plant growth observations in your project log sheet.'
      ],
      communityOutcome: 'Increases household food security while protecting soil structure against drought.',
      assessmentRubric: [
        { criterion: 'Accurate basin spacing & depth measurements', maxPoints: 5 },
        { criterion: 'Effective application of organic mulch layer', maxPoints: 5 },
        { criterion: 'Weekly observation log sheet completeness', maxPoints: 5 },
        { criterion: 'Community impact & reflective summary', maxPoints: 5 }
      ]
    };
  } else if (topic === 'heritage_monuments') {
    return {
      projectName: 'Local Community Heritage & Historical Landmark Preservation Map',
      zimsecSyllabusCode: 'ZIMSEC Heritage Studies Syllabus 4006 / Grade 7 FAIME',
      communityTopic: 'heritage_monuments',
      objectives: [
        'Identify local historical sites, shrines, or sacred trees in your community',
        'Interview village elders or community leaders regarding indigenous conservation oral histories',
        'Draw a detailed map featuring cultural conservation rules and heritage guidelines'
      ],
      requiredMaterials: ['Drawing paper & ruler', 'Recording notebook or phone', 'Color pencils'],
      fieldSteps: [
        'Step 1: Select a local heritage site (e.g., historical granite rock art, sacred spring, or community court).',
        'Step 2: Formulate 4 interview questions regarding how elders preserved this site in past decades.',
        'Step 3: Conduct a field visit with an adult supervisor and sketch the landmark feature.',
        'Step 4: Write down 3 traditional rules (Miko/Izaziso) used by ancestors to protect the ecosystem.'
      ],
      communityOutcome: 'Preserves indigenous knowledge systems (IKS) and strengthens youth cultural pride.',
      assessmentRubric: [
        { criterion: 'Elder interview depth & documentation', maxPoints: 5 },
        { criterion: 'Detailed hand-drawn site map with compass rose', maxPoints: 5 },
        { criterion: 'Identification of Indigenous Knowledge Systems (IKS)', maxPoints: 5 },
        { criterion: 'Presentation of preservation guidelines to class', maxPoints: 5 }
      ]
    };
  } else {
    return {
      projectName: 'Ubuntu / Hunhu Village Water & Environmental Hygiene Audit',
      zimsecSyllabusCode: 'ZIMSEC Environmental & Family Studies / Grade 5-7',
      communityTopic: 'clean_water_sanitation',
      objectives: [
        'Inspect community water sources (borehole, protected well, riverbank) for cleanliness',
        'Identify potential contamination hazards (garbage dumps, stray cattle)',
        'Propose 3 actionable community hygiene improvements using low-cost materials'
      ],
      requiredMaterials: ['Water inspection checklist', 'Camera or sketch pad', 'Clipboard'],
      fieldSteps: [
        'Step 1: Map the location of 2 main water sources used by neighboring families.',
        'Step 2: Observe drainage channels, soak-away pits, and fence protection around the water point.',
        'Step 3: Interview 3 water point committee members about borehole maintenance routines.',
        'Step 4: Organize a 30-minute community cleanup around the borehole area with classmates.'
      ],
      communityOutcome: 'Prevents waterborne diseases and promotes shared civic responsibility.',
      assessmentRubric: [
        { criterion: 'Water point inspection checklist accuracy', maxPoints: 5 },
        { criterion: 'Hazard mapping & environmental cleanliness rating', maxPoints: 5 },
        { criterion: 'Action plan feasibility & community cleanup participation', maxPoints: 5 },
        { criterion: 'Reflection on Ubuntu civic responsibility', maxPoints: 5 }
      ]
    };
  }
}

/**
 * Generate ZIMSEC Indigenous Language Worksheets (Shona / Ndebele / English)
 */
export function generateIndigenousLanguageData(
  language: 'Shona' | 'Ndebele' | 'English',
  type: 'tsumo_proverbs' | 'zvirahwe_riddles' | 'nzwisiso_comprehension'
): IndigenousLanguageData {
  if (language === 'Shona') {
    if (type === 'tsumo_proverbs') {
      return {
        language: 'Shona',
        topicType: 'tsumo_proverbs',
        passageText: `Tsumo dzinobatsira kudzidzisa tsika nehunhu munharaunda yedu. Pedzisa tsumo idzi dzakakosha:`,
        exercises: [
          { prompt: 'Anebofu anotungamira rimwe bofu... ➔', answer: 'vose vanowira mugomba', options: ['vose vanowira mugomba', 'vanowana zvakanaka', 'vanosvika pamba'] },
          { prompt: 'Chara chimwe hachitswanyi... ➔', answer: 'nda', options: ['nda', 'mbeva', 'shiri'] },
          { prompt: 'Kuwanda kwakazvakanaka, kupana mbeva... ➔', answer: 'dzinodyiwa nemasese', options: ['dzinodyiwa nemasese', 'dzinosvetuka', 'dzinosangana'] },
          { prompt: 'Rume rimwe harikombi... ➔', answer: 'churu', options: ['churu', 'sango', 'musha'] }
        ]
      };
    } else {
      return {
        language: 'Shona',
        topicType: 'zvirahwe_riddles',
        passageText: `Zvirahwe zvinopinza pfungwa nekukudza njere dzevana. Pindura zvirahwe zvinotevera:`,
        exercises: [
          { prompt: 'Chidhoma chinogona kukwira mumuti chisingatye: ➔', answer: 'Mbeva / Kamba', options: ['Mbeva', 'Gudo', 'Shiri'] },
          { prompt: 'Kare kare ndaona harahwa yakapfeka ngowani yebrown pachuru: ➔', answer: 'Huwundi / Bhowa (Mushroom)', options: ['Bhowa', 'Muti', 'Ibwe'] },
          { prompt: 'Rukova runochera ruwa rwose rusina foshoro: ➔', answer: 'Mvura zhinji / Mwando', options: ['Mvura', 'Mhepo', 'Zuva'] }
        ]
      };
    }
  } else if (language === 'Ndebele') {
    return {
      language: 'Ndebele',
      topicType: 'tsumo_proverbs',
      passageText: `Izaga lezisekelo zosiko lwethu ezibandakanya Ubuntu lobuhlakani. Qedela izaga lezi:`,
      exercises: [
        { prompt: 'Ukuhamba kubona... ➔', answer: 'okunengi', options: ['okunengi', 'isitha', 'indlela'] },
        { prompt: 'Isala kutshelwa sibona... ➔', answer: 'ngomopho', options: ['ngomopho', 'ngezulu', 'ngomlilo'] },
        { prompt: 'Ukwanda kwaliwa... ➔', answer: 'ngabathakathi', options: ['ngabathakathi', 'ngesitha', 'ngomakhelwane'] }
      ]
    };
  } else {
    return {
      language: 'English',
      topicType: 'nzwisiso_comprehension',
      passageText: `Heritage Studies & Environmental Conservation in Zimbabwe:
Zimbabwe is blessed with iconic national landmarks including Victoria Falls (Mosi-oa-Tunya), Great Zimbabwe, Matobo Hills, and Lake Kariba. Preserving these sites requires community effort, sustainable farming practices like Pfumvudza, and protecting indigenous tree species.`,
      exercises: [
        { prompt: 'What is the indigenous name for Victoria Falls?', answer: 'Mosi-oa-Tunya (The Smoke That Thunders)' },
        { prompt: 'Why is Great Zimbabwe historically significant?', answer: 'It represents ancient stone engineering built without mortar.' },
        { prompt: 'How does Pfumvudza farming protect the soil?', answer: 'It conserves moisture through organic mulching and reduced tillage.' }
      ]
    };
  }
}

/**
 * Return vector SVG line art elements for coloring pages based on educational theme
 */
export function getColoringThemeElements(theme: string): ColoringElement[] {
  if (theme === 'great_zimbabwe') {
    return [
      // Outer Granite Wall
      { id: 'gz_wall_outer', type: 'path', d: 'M 40,260 Q 200,200 360,260 L 360,320 Q 200,280 40,320 Z', strokeColor: '#000000', strokeWidth: 3, fillColor: '#ffffff', numberTag: 1, label: 'Granite Dry Stone Wall' },
      // Chevron Pattern on Top Wall
      { id: 'chev1', type: 'path', d: 'M 60,240 L 80,220 L 100,240 L 120,220 L 140,240 L 160,220 L 180,240 L 200,220 L 220,240 M 240,220 L 260,240 L 280,220 L 300,240', strokeColor: '#000000', strokeWidth: 2, fillColor: 'none' },
      // Conical Tower
      { id: 'conical_tower', type: 'path', d: 'M 220,250 L 235,110 Q 250,90 265,110 L 280,250 Z', strokeColor: '#000000', strokeWidth: 3, fillColor: '#ffffff', numberTag: 2, label: 'Conical Tower' },
      // Zimbabwe Bird on Pillar
      { id: 'bird_pillar', type: 'rect', x: 80, y: 120, width: 25, height: 100, strokeColor: '#000000', strokeWidth: 2, fillColor: '#ffffff', numberTag: 3 },
      { id: 'zim_bird', type: 'path', d: 'M 82,120 Q 80,95 92,90 Q 105,85 105,100 L 98,120 Z', strokeColor: '#000000', strokeWidth: 2, fillColor: '#ffffff', numberTag: 4, label: 'Zimbabwe Bird' },
      // Sun over Great Zimbabwe
      { id: 'sun_gz', type: 'circle', cx: 310, cy: 70, r: 30, strokeColor: '#000000', strokeWidth: 2, fillColor: '#ffffff', numberTag: 5 }
    ];
  } else if (theme === 'tsuro_na_gudo') {
    return [
      // Baobab Tree Trunk
      { id: 'baobab_trunk', type: 'path', d: 'M 160,320 C 140,240 130,160 170,120 C 190,100 230,100 250,120 C 290,160 280,240 260,320 Z', strokeColor: '#000000', strokeWidth: 3, fillColor: '#ffffff', numberTag: 1, label: 'Great Baobab Tree' },
      // Baobab Branches
      { id: 'branch1', type: 'path', d: 'M 170,140 Q 110,100 90,110 M 250,140 Q 310,100 330,110 M 210,100 L 210,50', strokeColor: '#000000', strokeWidth: 3, fillColor: 'none' },
      // Hare (Tsuro)
      { id: 'tsuro_body', type: 'circle', cx: 100, cy: 280, r: 25, strokeColor: '#000000', strokeWidth: 2, fillColor: '#ffffff', numberTag: 2, label: 'Tsuro (Hare)' },
      { id: 'tsuro_ears', type: 'path', d: 'M 90,260 L 85,210 Q 95,200 100,210 L 98,260', strokeColor: '#000000', strokeWidth: 2, fillColor: '#ffffff' },
      // Baboon (Gudo)
      { id: 'gudo_body', type: 'path', d: 'M 300,290 Q 310,240 330,240 Q 350,240 350,290 Z', strokeColor: '#000000', strokeWidth: 2, fillColor: '#ffffff', numberTag: 3, label: 'Gudo (Baboon)' }
    ];
  } else if (theme === 'solar_system') {
    return [
      // Sun
      { id: 'sun', type: 'circle', cx: 80, cy: 150, r: 50, strokeColor: '#000000', strokeWidth: 3, fillColor: '#ffffff', numberTag: 1, label: 'Sun' },
      // Rays
      { id: 'ray1', type: 'path', d: 'M 80,80 L 80,50 M 80,220 L 80,250 M 150,150 L 180,150', strokeColor: '#000000', strokeWidth: 3 },
      // Orbit lines
      { id: 'orbit1', type: 'path', d: 'M 80,150 M 80,30 A 120,120 0 0,1 200,150', strokeColor: '#888888', strokeWidth: 1.5 },
      // Mercury
      { id: 'mercury', type: 'circle', cx: 160, cy: 150, r: 12, strokeColor: '#000000', strokeWidth: 2, fillColor: '#ffffff', numberTag: 2, label: 'Mercury' },
      // Earth
      { id: 'earth', type: 'circle', cx: 240, cy: 150, r: 24, strokeColor: '#000000', strokeWidth: 2, fillColor: '#ffffff', numberTag: 3, label: 'Earth' },
      // Saturn & Ring
      { id: 'saturn', type: 'circle', cx: 340, cy: 150, r: 30, strokeColor: '#000000', strokeWidth: 2, fillColor: '#ffffff', numberTag: 4, label: 'Saturn' },
      { id: 'ring', type: 'path', d: 'M 290,150 C 290,130 390,130 390,150 C 390,170 290,170 290,150 Z', strokeColor: '#000000', strokeWidth: 2, fillColor: 'none' },
      // Stars
      { id: 'star1', type: 'path', d: 'M 200,60 L 205,75 L 220,75 L 208,85 L 212,100 L 200,90 L 188,100 L 192,85 L 180,75 L 195,75 Z', strokeColor: '#000000', strokeWidth: 2, fillColor: '#ffffff', numberTag: 1 },
      { id: 'star2', type: 'path', d: 'M 320,50 L 324,62 L 336,62 L 326,70 L 330,82 L 320,74 L 310,82 L 314,70 L 304,62 L 316,62 Z', strokeColor: '#000000', strokeWidth: 2, fillColor: '#ffffff', numberTag: 1 }
    ];
  } else if (theme === 'safari_animals') {
    return [
      // Giraffe Head & Neck Outline
      { id: 'giraffe_neck', type: 'path', d: 'M 180,300 L 180,140 Q 180,100 210,80 Q 240,60 250,90 Q 240,120 220,140 L 220,300 Z', strokeColor: '#000000', strokeWidth: 3, fillColor: '#ffffff', numberTag: 1, label: 'Body' },
      // Giraffe spots
      { id: 'spot1', type: 'circle', cx: 200, cy: 200, r: 10, strokeColor: '#000000', strokeWidth: 2, fillColor: '#ffffff', numberTag: 2 },
      { id: 'spot2', type: 'circle', cx: 195, cy: 240, r: 12, strokeColor: '#000000', strokeWidth: 2, fillColor: '#ffffff', numberTag: 2 },
      { id: 'spot3', type: 'circle', cx: 205, cy: 160, r: 8, strokeColor: '#000000', strokeWidth: 2, fillColor: '#ffffff', numberTag: 2 },
      // Giraffe Horns / Ears
      { id: 'ear1', type: 'path', d: 'M 215,75 Q 190,60 200,80 Z', strokeColor: '#000000', strokeWidth: 2, fillColor: '#ffffff' },
      { id: 'horn1', type: 'path', d: 'M 225,65 L 225,45 Q 225,40 230,40 Q 235,40 235,45 L 235,65 Z', strokeColor: '#000000', strokeWidth: 2, fillColor: '#ffffff' },
      // Sun & Clouds
      { id: 'sun', type: 'circle', cx: 60, cy: 60, r: 30, strokeColor: '#000000', strokeWidth: 2, fillColor: '#ffffff', numberTag: 3 },
      { id: 'cloud', type: 'path', d: 'M 300,70 Q 310,50 330,50 Q 350,50 360,70 Q 375,70 375,85 Q 375,100 350,100 L 300,100 Q 285,100 285,85 Q 285,70 300,70 Z', strokeColor: '#000000', strokeWidth: 2, fillColor: '#ffffff', numberTag: 4 }
    ];
  } else if (theme === 'chemistry_lab') {
    return [
      // Flask 1
      { id: 'flask_neck', type: 'rect', x: 100, y: 80, width: 25, height: 50, strokeColor: '#000000', strokeWidth: 2, fillColor: '#ffffff' },
      { id: 'flask_body', type: 'path', d: 'M 100,130 L 60,220 Q 50,240 70,240 L 155,240 Q 175,240 165,220 L 125,130 Z', strokeColor: '#000000', strokeWidth: 3, fillColor: '#ffffff', numberTag: 1 },
      // Liquid inside flask
      { id: 'liquid', type: 'path', d: 'M 75,190 Q 112,180 150,190 L 158,225 Q 155,235 140,235 L 85,235 Q 70,235 68,225 Z', strokeColor: '#000000', strokeWidth: 2, fillColor: '#ffffff', numberTag: 2 },
      // Bubbles
      { id: 'b1', type: 'circle', cx: 112, cy: 160, r: 6, strokeColor: '#000000', strokeWidth: 1.5, fillColor: '#ffffff' },
      { id: 'b2', type: 'circle', cx: 100, cy: 120, r: 8, strokeColor: '#000000', strokeWidth: 1.5, fillColor: '#ffffff' },
      { id: 'b3', type: 'circle', cx: 120, cy: 60, r: 10, strokeColor: '#000000', strokeWidth: 1.5, fillColor: '#ffffff' },
      // Microscope outline
      { id: 'microscope_base', type: 'rect', x: 230, y: 220, width: 120, height: 20, strokeColor: '#000000', strokeWidth: 3, fillColor: '#ffffff', numberTag: 3 },
      { id: 'microscope_arm', type: 'path', d: 'M 290,220 L 290,130 Q 290,100 260,90 L 240,90', strokeColor: '#000000', strokeWidth: 4, fillColor: 'none' },
      { id: 'microscope_lens', type: 'rect', x: 230, y: 110, width: 20, height: 40, strokeColor: '#000000', strokeWidth: 2, fillColor: '#ffffff', numberTag: 4 }
    ];
  } else {
    // Geometry & Cell Default Lineart
    return [
      { id: 'cell_wall', type: 'path', d: 'M 50,50 Q 200,20 350,50 Q 380,180 350,300 Q 200,330 50,300 Q 20,180 50,50 Z', strokeColor: '#000000', strokeWidth: 3, fillColor: '#ffffff', numberTag: 1, label: 'Cell Wall' },
      { id: 'nucleus', type: 'circle', cx: 200, cy: 175, r: 45, strokeColor: '#000000', strokeWidth: 2.5, fillColor: '#ffffff', numberTag: 2, label: 'Nucleus' },
      { id: 'nucleolus', type: 'circle', cx: 190, cy: 165, r: 18, strokeColor: '#000000', strokeWidth: 2, fillColor: '#ffffff', numberTag: 3, label: 'Nucleolus' },
      { id: 'mitochondria', type: 'path', d: 'M 90,100 Q 120,80 140,110 Q 110,130 90,100 Z', strokeColor: '#000000', strokeWidth: 2, fillColor: '#ffffff', numberTag: 4 }
    ];
  }
}

/**
 * High-Contrast Print-Ready HTML Generator for Educational & Coloring Workbooks
 */
export function exportEducationalBookToPdfHtml(project: EducationalBookProject): string {
  const isColor = false; // B&W line-art for school photocopying budget

  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${project.title} - Academic & Coloring Workbook</title>
  <style>
    @page {
      size: letter portrait;
      margin: 0.6in;
    }
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      color: #111;
      margin: 0;
      padding: 0;
      background: #fff;
      -webkit-print-color-adjust: exact;
    }
    .page {
      page-break-after: always;
      position: relative;
      min-height: 9.5in;
      box-sizing: border-box;
      padding-bottom: 0.5in;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #000;
      padding-bottom: 8px;
      margin-bottom: 16px;
    }
    .header-title {
      font-size: 16pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .student-info {
      display: flex;
      gap: 20px;
      font-size: 10pt;
      font-weight: bold;
    }
    .instructions {
      font-size: 11pt;
      font-style: italic;
      background: #f4f4f4;
      padding: 8px 12px;
      border-left: 4px solid #000;
      margin-bottom: 20px;
    }
    .footer-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #aaa;
      padding-top: 6px;
      font-size: 9pt;
      color: #555;
    }
    .cover-page {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      border: 6px double #000;
      padding: 40px;
      height: 9in;
    }
    .math-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
      margin-top: 20px;
    }
    .math-card {
      border: 1.5px solid #000;
      padding: 16px;
      border-radius: 8px;
      font-size: 14pt;
    }
    .word-search-container {
      display: flex;
      gap: 30px;
      margin-top: 20px;
    }
    .ws-table {
      border-collapse: collapse;
      font-family: monospace;
      font-size: 16pt;
      font-weight: bold;
    }
    .ws-table td {
      width: 32px;
      height: 32px;
      text-align: center;
      border: 1px solid #ccc;
    }
  </style>
</head>
<body>

  <!-- COVER PAGE -->
  <div class="page cover-page">
    <div style="font-size: 12pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 12px;">
      ${project.targetAgeGroup} • ${project.subject.toUpperCase()}
    </div>
    <h1 style="font-size: 32pt; margin: 0; font-family: Georgia, serif; border-bottom: 3px solid #000; padding-bottom: 12px; width: 80%;">
      ${project.title}
    </h1>
    <h3 style="font-size: 16pt; font-weight: normal; margin-top: 12px; font-style: italic; color: #444;">
      ${project.subtitle}
    </h3>
    
    <div style="margin: 40px 0; border: 2px dashed #000; padding: 30px 60px; font-size: 11pt;">
      <p style="margin: 8px 0;">Student Name: ________________________________</p>
      <p style="margin: 8px 0;">Grade / Class: ________________________________</p>
      <p style="margin: 8px 0;">Teacher: _____________________________________</p>
    </div>

    <div style="font-size: 10pt; color: #666; margin-top: auto;">
      Author / Publisher: ${project.author} | Primary & Secondary Educational Series
    </div>
  </div>
  `;

  // WORKBOOK PAGES
  project.pages.forEach((page) => {
    const fontStyle = page.fontFamily === 'serif' ? 'font-family: Georgia, serif;' :
                      page.fontFamily === 'mono' ? 'font-family: monospace;' :
                      page.fontFamily === 'dyslexic' ? 'font-family: sans-serif; letter-spacing: 0.05em; line-height: 1.8;' :
                      'font-family: system-ui, sans-serif;';

    html += `
    <div class="page" style="${fontStyle}">
      ${(page.customHeader || page.chapterTitle || page.chapterNumber) ? `
        <div style="display: flex; justify-content: space-between; font-size: 8.5pt; font-weight: bold; text-transform: uppercase; color: #666; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 8px;">
          <span>${page.chapterNumber ? `Chapter ${page.chapterNumber}` : ''}${page.chapterTitle ? `: ${page.chapterTitle}` : ''}</span>
          <span>${page.customHeader || project.headerText || ''}</span>
        </div>
      ` : ''}

      <div class="header-bar">
        <div class="header-title">${page.title}</div>
        <div class="student-info">
          <span>Name: ____________</span>
          <span>Date: _________</span>
        </div>
      </div>

      <div class="instructions">
        <strong>Task:</strong> ${page.instructions}
      </div>

      ${page.imageData ? `
        <div style="text-align: ${page.imageData.alignment || 'center'}; margin: 12px 0;">
          <img src="${page.imageData.url}" alt="${page.imageData.caption || ''}" style="max-width: ${page.imageData.widthPercent || 75}%; max-height: 250px; border: 1px solid #ccc; border-radius: 4px;" />
          ${page.imageData.caption ? `<div style="font-size: 8.5pt; font-style: italic; color: #555; margin-top: 4px;">${page.imageData.caption}</div>` : ''}
        </div>
      ` : ''}
    `;

    if (page.type === 'data_sheet_table' && page.tableData) {
      const t = page.tableData;
      html += `
        <div style="margin: 16px 0;">
          <h4 style="margin: 0 0 8px 0; text-transform: uppercase; font-size: 11pt;">${t.title || 'Data Sheet Table'}</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 9.5pt;">
            <thead>
              <tr style="background: #f1f5f9;">
                ${t.headers.map(h => `<th style="border: 1.5px solid #000; padding: 8px; text-align: left;">${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${t.rows.map(row => `
                <tr>
                  ${row.map(cell => `<td style="border: 1px solid #000; padding: 6px 8px;">${cell}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else if (page.type === 'graph_chart' && page.chartData) {
      const c = page.chartData;
      const chartItems = c.items || (c.labels || []).map((l, i) => ({
        label: l,
        value: c.dataPoints?.[i] ?? 0,
        color: c.color
      }));
      const maxVal = Math.max(...chartItems.map(i => i.value), 10);
      html += `
        <div style="margin: 16px 0; border: 1.5px solid #000; padding: 16px; border-radius: 8px;">
          <h4 style="margin: 0 0 12px 0; text-transform: uppercase; font-size: 11pt; text-align: center;">${c.title} (${c.type.toUpperCase()} CHART)</h4>
          <div style="display: flex; align-items: flex-end; justify-content: space-around; height: 180px; border-left: 2px solid #000; border-bottom: 2px solid #000; padding: 10px 20px 0 20px;">
            ${chartItems.map(item => {
              const barHeightPct = Math.round((item.value / maxVal) * 100);
              return `
                <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; width: 40px;">
                  <span style="font-size: 8pt; font-weight: bold;">${item.value}</span>
                  <div style="width: 100%; height: ${barHeightPct}%; background: ${item.color || '#10b981'}; border-radius: 4px 4px 0 0; border: 1px solid #000;"></div>
                  <span style="font-size: 8pt; font-weight: bold; text-align: center;">${item.label}</span>
                </div>
              `;
            }).join('')}
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 8pt; color: #555;">
            <span>Y-Axis: ${c.yAxisLabel || 'Value'}</span>
            <span>X-Axis: ${c.xAxisLabel || 'Category'}</span>
          </div>
        </div>
      `;
    } else if (page.type === 'folktale_story' && page.folktaleData) {
      const f = page.folktaleData;
      html += `
        <div style="font-size: 9pt; font-weight: bold; text-transform: uppercase; color: #444; margin-bottom: 6px;">
          Cultural Origin: ${f.cultureOrigin}
        </div>
        
        <div style="border: 1.5px solid #000; padding: 14px; border-radius: 6px; font-size: 10.5pt; line-height: 1.6; background: #fafafa; margin-bottom: 14px;">
          <strong style="font-size: 12pt; display: block; margin-bottom: 6px;">${f.title}</strong>
          <p style="margin: 0;">${f.storyText}</p>
        </div>

        <div style="border: 1px dashed #000; padding: 10px; border-radius: 4px; background: #fff8f0; margin-bottom: 14px; font-size: 9.5pt;">
          <strong>Moral Value (Hunhu / Ubuntu):</strong> ${f.moralLesson}
          ${f.proverbs && f.proverbs.length > 0 ? `
            <div style="margin-top: 6px; font-style: italic;">
              ${f.proverbs.map(p => `<div>• <strong>${p.proverb}</strong> (${p.language}): "${p.meaning}"</div>`).join('')}
            </div>
          ` : ''}
        </div>

        <div>
          <h4 style="margin: 0 0 8px 0; font-size: 10pt; text-transform: uppercase;">Story Comprehension Questions:</h4>
          ${f.comprehensionQuestions.map((q, idx) => `
            <div style="margin-bottom: 14px; font-size: 10pt;">
              <strong>Q${idx + 1}: ${q.question}</strong>
              <div style="height: 32px; border-bottom: 1.5px underline #888; margin-top: 6px; text-align: right; font-size: 8.5pt; color: #888;">
                Student Answer: _____________________________________________
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else if (page.type === 'community_project' && page.communityProjectData) {
      const p = page.communityProjectData;
      html += `
        <div style="border: 2px solid #000; padding: 12px; border-radius: 6px; margin-bottom: 14px;">
          <h3 style="margin: 0 0 6px 0; font-size: 12pt; text-transform: uppercase;">${p.projectName}</h3>
          <div style="font-size: 9pt; font-weight: bold; color: #444;">ZIMSEC Schema Code: ${p.zimsecSyllabusCode}</div>
          
          <div style="margin-top: 10px; font-size: 9.5pt;">
            <strong>Learning Objectives:</strong>
            <ul style="margin: 4px 0 8px 18px; padding: 0;">
              ${p.objectives.map(o => `<li>${o}</li>`).join('')}
            </ul>
          </div>

          <div style="font-size: 9.5pt;">
            <strong>Required Field Materials:</strong> ${p.requiredMaterials.join(', ')}
          </div>
        </div>

        <div style="font-size: 9.5pt; margin-bottom: 14px;">
          <strong>Practical Field Instructions:</strong>
          <div style="margin-top: 6px; line-height: 1.6;">
            ${p.fieldSteps.map(step => `<div style="margin-bottom: 4px; padding-left: 8px; border-left: 2px solid #000;">${step}</div>`).join('')}
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 9pt; margin-top: 12px;">
          <thead>
            <tr style="background: #eee;">
              <th style="border: 1px solid #000; padding: 6px; text-align: left;">Assessment Rubric Criterion</th>
              <th style="border: 1px solid #000; padding: 6px; width: 80px; text-align: center;">Max Points</th>
              <th style="border: 1px solid #000; padding: 6px; width: 100px; text-align: center;">Score</th>
            </tr>
          </thead>
          <tbody>
            ${p.assessmentRubric.map(r => `
              <tr>
                <td style="border: 1px solid #000; padding: 6px;">${r.criterion}</td>
                <td style="border: 1px solid #000; padding: 6px; text-align: center;">${r.maxPoints} pts</td>
                <td style="border: 1px solid #000; padding: 6px; text-align: center;">_____</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (page.type === 'language_translation' && page.languageData) {
      const l = page.languageData;
      html += `
        <div style="border: 1.5px solid #000; padding: 12px; border-radius: 6px; margin-bottom: 14px; background: #fafafa;">
          <h4 style="margin: 0 0 6px 0; font-size: 11pt; text-transform: uppercase; text-decoration: underline;">
            ${l.language} Language Exercise (${l.topicType.toUpperCase().replace('_', ' ')})
          </h4>
          <p style="margin: 0; font-size: 10pt; font-style: italic;">${l.passageText || ''}</p>
        </div>

        <div style="margin-top: 14px;">
          ${l.exercises.map((ex, idx) => `
            <div style="border: 1px solid #000; padding: 10px; border-radius: 6px; margin-bottom: 10px; font-size: 10pt;">
              <strong>${idx + 1}. ${ex.prompt}</strong>
              ${ex.options && ex.options.length > 0 ? `
                <div style="display: flex; gap: 16px; margin-top: 6px; font-size: 9.5pt;">
                  ${ex.options.map(opt => `<span>[ &nbsp; ] ${opt}</span>`).join('')}
                </div>
              ` : ''}
              <div style="height: 28px; border-bottom: 1.5px underline #888; margin-top: 6px; font-size: 8.5pt; color: #888;">
                Answer: _______________________
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else if (page.type === 'coloring_lineart') {
      const elements = page.coloringElements || getColoringThemeElements(page.coloringTheme || 'solar_system');
      html += `
        <div style="text-align: center; margin: 20px 0;">
          ${page.colorByNumberLegend && page.colorByNumberLegend.length > 0 ? `
            <div style="display: flex; justify-content: center; gap: 12px; margin-bottom: 16px; font-size: 10pt; font-weight: bold;">
              ${page.colorByNumberLegend.map(l => `
                <span style="border: 1px solid #000; padding: 4px 8px; border-radius: 4px;">
                  ${l.number} = ${l.colorName}
                </span>
              `).join('')}
            </div>
          ` : ''}
          
          <svg width="550" height="420" viewBox="0 0 550 420" style="border: 2px solid #000; border-radius: 8px; background: #fff;">
            ${elements.map(el => {
              if (el.type === 'circle') {
                return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" stroke="${el.strokeColor || '#000'}" stroke-width="${el.strokeWidth || 2}" fill="${el.fillColor || '#fff'}" />`;
              } else if (el.type === 'rect') {
                return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" stroke="${el.strokeColor || '#000'}" stroke-width="${el.strokeWidth || 2}" fill="${el.fillColor || '#fff'}" />`;
              } else {
                return `<path d="${el.d}" stroke="${el.strokeColor || '#000'}" stroke-width="${el.strokeWidth || 2}" fill="${el.fillColor || 'none'}" />`;
              }
            }).join('')}
          </svg>
        </div>
      `;
    } else if (page.type === 'math_worksheet') {
      const mathList = page.mathProblems || generateMathProblems('addition', 8);
      html += `
        <div class="math-grid">
          ${mathList.map((prob, idx) => {
            let renderedMath = prob.expression;
            try {
              renderedMath = katex.renderToString(prob.expression, {
                throwOnError: false,
                displayMode: true,
                output: 'mathml',
                trust: false,
                strict: 'warn',
              });
            } catch (err) {
              renderedMath = `<span style="font-family: monospace; font-weight: bold;">${prob.expression}</span>`;
            }
            return `
              <div class="math-card">
                <div style="font-weight: bold; font-size: 10pt; color: #555; margin-bottom: 6px;">Problem #${idx + 1}</div>
                <div style="margin: 12px 0; text-align: center;">${renderedMath}</div>
                <div style="height: 36px; border-bottom: 2px underline #999; text-align: right; font-size: 10pt; color: #888;">
                  Show work / Answer: ________
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } else if (page.type === 'word_puzzle') {
      const grid = page.wordSearchGrid || generateWordSearchGrid(['SOLAR', 'EARTH', 'ORBIT', 'STAR', 'PLANET']);
      const wordList = page.wordList || [
        { word: 'SOLAR', clue: 'Relating to the Sun' },
        { word: 'EARTH', clue: 'Our home planet' },
        { word: 'ORBIT', clue: 'Path around a star' }
      ];

      html += `
        <div class="word-search-container">
          <table class="ws-table">
            ${grid.map(row => `
              <tr>
                ${row.map(cell => `<td>${cell}</td>`).join('')}
              </tr>
            `).join('')}
          </table>

          <div style="flex: 1; border: 1.5px solid #000; padding: 16px; border-radius: 8px;">
            <h4 style="margin: 0 0 12px 0; text-transform: uppercase; font-size: 11pt;">Word Bank to Find:</h4>
            <ul style="padding-left: 20px; font-size: 10.5pt; line-height: 1.8;">
              ${wordList.map(w => `
                <li><strong>${w.word}</strong> - <em>${w.clue}</em></li>
              `).join('')}
            </ul>
          </div>
        </div>
      `;
    } else if (page.type === 'past_exam_paper' && page.pastExamData) {
      const exam = page.pastExamData;
      html += `
        <div style="border: 2px solid #000; padding: 16px; border-radius: 4px; margin-bottom: 16px; background: #fff;">
          <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px;">
            <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase;">ZIMBABWE SCHOOL EXAMINATIONS COUNCIL</div>
            <div style="font-size: 10pt; font-weight: bold; margin-top: 2px;">${exam.examSession}</div>
            <div style="font-size: 12pt; font-weight: 900; margin-top: 4px; color: #000;">SUBJECT CODE: ${exam.subjectCode}</div>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 9.5pt; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 6px; margin-bottom: 12px;">
            <span>TIME ALLOWED: ${exam.timeAllowed}</span>
            <span>TOTAL MARKS: ${exam.totalMarks} MARKS</span>
          </div>

          <div style="font-size: 9pt; margin-bottom: 14px; background: #f8fafc; padding: 10px; border: 1px solid #cbd5e1; border-radius: 4px;">
            <strong style="text-transform: uppercase; display: block; margin-bottom: 4px;">INSTRUCTIONS TO CANDIDATES:</strong>
            <ol style="margin: 0; padding-left: 20px;">
              ${exam.instructionsToCandidates.map(inst => `<li>${inst}</li>`).join('')}
            </ol>
          </div>

          ${exam.sections.map(sec => `
            <div style="margin-top: 16px; border-top: 1.5px solid #000; padding-top: 10px;">
              <h4 style="margin: 0 0 6px 0; font-size: 10.5pt; text-transform: uppercase; background: #e2e8f0; padding: 4px 8px; border-left: 4px solid #000;">${sec.sectionName}</h4>
              ${sec.instructions ? `<div style="font-size: 8.5pt; font-style: italic; margin-bottom: 10px;">${sec.instructions}</div>` : ''}

              <div style="display: flex; flex-direction: column; gap: 12px;">
                ${sec.questions.map(q => `
                  <div style="padding: 10px; border: 1px solid #e2e8f0; border-radius: 4px; background: #fff;">
                    <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 10pt; margin-bottom: 4px;">
                      <span>Question ${q.questionNumber}:</span>
                      <span style="color: #059669;">[${q.marks} Mark${q.marks > 1 ? 's' : ''}]</span>
                    </div>
                    <div style="font-size: 10pt; margin-bottom: 6px;">${q.questionText}</div>

                    ${q.options && q.options.length > 0 ? `
                      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 9.5pt; margin-top: 6px; padding-left: 12px;">
                        ${q.options.map(opt => `<div style="padding: 4px; background: #f1f5f9; border-radius: 4px;">${opt}</div>`).join('')}
                      </div>
                    ` : ''}

                    <div style="height: ${q.marks * 20 + 20}px; border-bottom: 1px underline #cbd5e1; margin-top: 8px; text-align: right; font-size: 8.5pt; color: #94a3b8;">
                      Candidate Answer Space (${q.marks} Marks) _________________________
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else if (page.type === 'revision_test' && page.revisionTestData) {
      const rev = page.revisionTestData;
      html += `
        <div style="border: 2px solid #2563eb; padding: 16px; border-radius: 6px; margin-bottom: 16px; background: #fff;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 8px; margin-bottom: 12px;">
            <div>
              <h3 style="margin: 0; font-size: 13pt; text-transform: uppercase; color: #1e40af;">${rev.testTitle}</h3>
              <div style="font-size: 9pt; color: #475569;">Syllabus Topic: <strong>${rev.syllabusTopic}</strong></div>
            </div>
            <div style="text-align: right; border: 1.5px solid #2563eb; padding: 6px 12px; border-radius: 4px; background: #eff6ff;">
              <div style="font-size: 8pt; font-weight: bold; text-transform: uppercase; color: #1e40af;">Time Allowed</div>
              <div style="font-size: 11pt; font-weight: 900;">${rev.timeLimitMinutes} Mins</div>
              <div style="font-size: 8.5pt; font-weight: bold; color: #059669; margin-top: 2px;">Total: ${rev.totalPoints} Marks</div>
            </div>
          </div>

          <div style="font-size: 9pt; font-style: italic; margin-bottom: 14px; background: #f8fafc; padding: 8px; border-radius: 4px; border: 1px solid #e2e8f0;">
            <strong>Instructions:</strong> ${rev.instructions}
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            ${rev.questions.map(q => `
              <div style="padding: 12px; border: 1px solid #cbd5e1; border-radius: 6px; background: #fff;">
                <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 10pt; margin-bottom: 6px;">
                  <span style="color: #1e3a8a;">Question ${q.questionNum}:</span>
                  <span style="color: #059669; background: #ecfdf5; px: 6px; py: 2px; border-radius: 4px;">[Max Points: ${q.maxPoints}]</span>
                </div>
                <div style="font-size: 10pt; margin-bottom: 8px; line-height: 1.5;">${q.question}</div>
                <div style="height: ${(q.answerSpaceLines || 3) * 24}px; border-bottom: 1.5px underline #94a3b8; margin-top: 8px; text-align: right; font-size: 8.5pt; color: #94a3b8;">
                  Write Answer Here ________________________________________
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (page.type === 'cad_drafting' && page.cadDraftingData) {
      const cad = page.cadDraftingData;
      html += `
        <div style="border: 2px solid #000; padding: 16px; border-radius: 6px; margin-bottom: 16px; background: #fff;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px;">
            <div>
              <span style="font-size: 9pt; font-weight: bold; color: #0284c7; text-transform: uppercase;">${cad.software}</span>
              <h3 style="margin: 2px 0 0 0; font-size: 13pt;">${cad.title}</h3>
            </div>
            <div style="font-family: monospace; font-size: 9pt; text-align: right;">
              <div>Scale: <strong>${cad.scale}</strong></div>
              <div>Units: <strong>${cad.projectUnits}</strong></div>
            </div>
          </div>

          <div style="border: 2px solid #000; background: #0f172a; color: #fff; padding: 16px; border-radius: 6px; text-align: center; margin-bottom: 12px;">
            <div style="font-family: monospace; font-size: 10pt; color: #38bdf8; font-weight: bold; margin-bottom: 8px;">
              [${cad.software} VECTOR BLUEPRINT - DRAWING KEY: ${cad.blueprintSvgKey.toUpperCase()}]
            </div>
            <div style="font-family: monospace; font-size: 9pt; line-height: 1.6; color: #cbd5e1;">
              ${cad.dimensions.map(d => `<div>${d.label}: <strong>${d.value}</strong></div>`).join('')}
            </div>
          </div>

          <div style="font-size: 10pt; font-weight: bold; margin-bottom: 8px;">CAD Drafting Exercise Tasks:</div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${cad.exerciseTasks.map(t => `
              <div style="border: 1px solid #cbd5e1; padding: 10px; border-radius: 4px;">
                <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 9pt;">
                  <span>Task #${t.taskNumber}:</span>
                  <span style="color: #059669;">[${t.maxPoints} Points]</span>
                </div>
                <div style="font-size: 9.5pt; margin: 4px 0 8px 0;">${t.instruction}</div>
                <div style="height: 40px; border-bottom: 1px solid #94a3b8; font-size: 8pt; color: #94a3b8; text-align: right; padding-top: 24px;">
                  Student Answer / Calculation ________________________________________
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (page.type === 'three_d_printing' && page.threeDPrintingData) {
      const pr = page.threeDPrintingData;
      html += `
        <div style="border: 2px solid #10b981; padding: 16px; border-radius: 6px; margin-bottom: 16px; background: #fff;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #10b981; padding-bottom: 8px; margin-bottom: 12px;">
            <div>
              <span style="font-size: 9pt; font-weight: bold; color: #047857; text-transform: uppercase;">${pr.printerTechnology} • Filament: ${pr.filamentType}</span>
              <h3 style="margin: 2px 0 0 0; font-size: 13pt;">3D Printing Dynamics (${pr.topic.replace(/_/g, ' ').toUpperCase()})</h3>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; font-size: 8.5pt; margin-bottom: 12px;">
            <div style="border: 1px solid #cbd5e1; padding: 6px; border-radius: 4px; background: #f8fafc;">
              <div style="color: #64748b; font-size: 7.5pt; font-weight: bold;">LAYER HEIGHT</div>
              <div style="font-family: monospace; font-weight: bold;">${pr.slicerSettings.layerHeightMm} mm</div>
            </div>
            <div style="border: 1px solid #cbd5e1; padding: 6px; border-radius: 4px; background: #f8fafc;">
              <div style="color: #64748b; font-size: 7.5pt; font-weight: bold;">HOTEND / BED</div>
              <div style="font-family: monospace; font-weight: bold;">${pr.slicerSettings.nozzleTempC}°C / ${pr.slicerSettings.bedTempC}°C</div>
            </div>
            <div style="border: 1px solid #cbd5e1; padding: 6px; border-radius: 4px; background: #f8fafc;">
              <div style="color: #64748b; font-size: 7.5pt; font-weight: bold;">SPEED</div>
              <div style="font-family: monospace; font-weight: bold;">${pr.slicerSettings.printSpeedMmS} mm/s</div>
            </div>
            <div style="border: 1px solid #cbd5e1; padding: 6px; border-radius: 4px; background: #f8fafc;">
              <div style="color: #64748b; font-size: 7.5pt; font-weight: bold;">INFILL</div>
              <div style="font-family: monospace; font-weight: bold; color: #059669;">${pr.slicerSettings.infillDensityPercent}% ${pr.slicerSettings.infillPattern}</div>
            </div>
          </div>

          <div style="font-size: 10pt; font-weight: bold; margin-bottom: 8px;">Additive Manufacturing Questions:</div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${pr.exerciseQuestions.map(q => `
              <div style="border: 1px solid #cbd5e1; padding: 10px; border-radius: 4px;">
                <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 9pt;">
                  <span>Question #${q.questionNum}:</span>
                  <span style="color: #059669;">[${q.points} Points]</span>
                </div>
                <div style="font-size: 9.5pt; margin: 4px 0 8px 0;">${q.question}</div>
                <div style="height: 40px; border-bottom: 1px solid #94a3b8; font-size: 8pt; color: #94a3b8; text-align: right; padding-top: 24px;">
                  Student Answer ________________________________________
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Teacher note
    if (page.teacherTip) {
      html += `
        <div style="margin-top: 24px; font-size: 9pt; color: #444; border-top: 1px dotted #888; padding-top: 6px;">
          <strong>Teacher / Parent Note:</strong> ${page.teacherTip}
        </div>
      `;
    }

    html += `
      <div class="footer-bar">
        <span>${project.title}</span>
        <span>Page ${page.pageNumber}</span>
      </div>
    </div>
    `;
  });

  html += `
</body>
</html>
  `;

  return html;
}

/**
 * Generates a fully standalone single-file HTML Application Shell.
 * This file can be saved and opened on any offline computer or tablet without internet access.
 */
export function exportEducationalBookToOfflineShellHtml(project: EducationalBookProject): string {
  const offlineProject = {
    ...project,
    pages: project.pages.map(page => ({
      ...page,
      mathProblems: page.mathProblems?.map(problem => {
        let renderedMath = problem.expression;
        try {
          renderedMath = katex.renderToString(problem.expression, {
            throwOnError: false,
            displayMode: true,
            output: 'mathml',
            trust: false,
            strict: 'warn',
          });
        } catch {
          // Keep the inert source as a readable offline fallback.
        }
        return { ...problem, renderedMath };
      }),
    })),
  };
  const projectJson = JSON.stringify(offlineProject).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.title} - Standalone Offline App Shell</title>
  <style>
    :root {
      --bg: #0f172a;
      --card-bg: #1e293b;
      --border: #334155;
      --text: #f8fafc;
      --muted: #94a3b8;
      --accent: #10b981;
      --accent-hover: #059669;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header {
      background: #090d16;
      border-b: 1px solid var(--border);
      padding: 12px 24px;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-icon {
      width: 36px;
      height: 36px;
      background: var(--accent);
      color: #000;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 18px;
    }
    .title-area h1 {
      margin: 0;
      font-size: 16px;
      font-weight: 800;
    }
    .title-area p {
      margin: 2px 0 0 0;
      font-size: 12px;
      color: var(--muted);
    }
    .top-actions {
      display: flex;
      gap: 8px;
    }
    .btn {
      background: var(--card-bg);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn:hover {
      background: var(--border);
    }
    .btn-primary {
      background: var(--accent);
      color: #000;
      border-color: var(--accent);
    }
    .btn-primary:hover {
      background: var(--accent-hover);
    }
    .main-layout {
      flex: 1;
      display: grid;
      grid-template-columns: 260px 1fr;
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
      padding: 16px;
      gap: 16px;
    }
    @media (max-width: 800px) {
      .main-layout { grid-template-columns: 1fr; }
    }
    sidebar {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .sidebar-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: var(--muted);
      letter-spacing: 0.05em;
      margin-bottom: 8px;
    }
    .nav-item {
      padding: 10px 12px;
      border-radius: 8px;
      border: 1px solid transparent;
      background: rgba(255,255,255,0.02);
      font-size: 13px;
      font-weight: 600;
      color: var(--text);
      cursor: pointer;
      text-align: left;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.15s;
    }
    .nav-item:hover {
      background: rgba(255,255,255,0.06);
      border-color: var(--border);
    }
    .nav-item.active {
      background: rgba(16, 185, 129, 0.15);
      border-color: var(--accent);
      color: var(--accent);
    }
    .page-container {
      background: #ffffff;
      color: #111111;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      min-height: 600px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    /* Printable & Paper Styling inside Offline Container */
    .paper-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #000;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .paper-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 900;
      text-transform: uppercase;
    }
    .paper-instructions {
      background: #f1f5f9;
      border-left: 4px solid #0f172a;
      padding: 10px 14px;
      font-size: 13px;
      font-style: italic;
      margin-bottom: 20px;
    }
    .math-grid-offline {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
    }
    .math-card-offline {
      border: 1.5px solid #000;
      padding: 16px;
      border-radius: 8px;
      background: #fafafa;
    }
    .math-card-offline input {
      width: 100%;
      padding: 6px 10px;
      border: 1px solid #94a3b8;
      border-radius: 4px;
      font-family: monospace;
      font-size: 14px;
      margin-top: 8px;
    }
    .ws-table-offline {
      border-collapse: collapse;
      font-family: monospace;
      font-weight: bold;
      font-size: 18px;
    }
    .ws-table-offline td {
      width: 36px;
      height: 36px;
      border: 1px solid #cbd5e1;
      text-align: center;
      cursor: pointer;
      user-select: none;
    }
    .ws-table-offline td.selected {
      background: #fde047;
      color: #000;
    }
    .color-palette {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
      justify-content: center;
    }
    .swatch {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid #000;
      cursor: pointer;
      transition: transform 0.15s;
    }
    .swatch:hover, .swatch.active {
      transform: scale(1.2);
    }
    .footer-note {
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
      font-size: 11px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
    }
    @media print {
      header, sidebar, .top-actions { display: none !important; }
      .main-layout { display: block; padding: 0; }
      .page-container { box-shadow: none; padding: 0; min-height: auto; }
    }
  </style>
</head>
<body>

  <header>
    <div class="brand">
      <div class="brand-icon">Z</div>
      <div class="title-area">
        <h1 id="app-title">${project.title}</h1>
        <p>Offline Desktop & Mobile Educational Shell • ${project.targetAgeGroup}</p>
      </div>
    </div>

    <div class="top-actions">
      <button class="btn" onclick="window.print()">🖨️ Print Pages</button>
      <button class="btn btn-primary" onclick="toggleAnswerKey()">🔑 Answer Keys</button>
    </div>
  </header>

  <div class="main-layout">
    <sidebar>
      <div class="sidebar-title">Workbook Navigation</div>
      <div id="nav-list"></div>
    </sidebar>

    <div class="page-container" id="page-content">
      <!-- Dynamic Content Rendered Here -->
    </div>
  </div>

  <script>
    const PROJECT_DATA = ${projectJson};
    let activePageIndex = 0; // 0 = Cover, 1..N = Pages
    let activeColor = '#10b981';

    function initShell() {
      renderNav();
      renderPage(0);
    }

    function renderNav() {
      const navList = document.getElementById('nav-list');
      let html = \`
        <button class="nav-item \${activePageIndex === 0 ? 'active' : ''}" onclick="selectPage(0)">
          📘 Cover Page
        </button>
      \`;

      PROJECT_DATA.pages.forEach((p, idx) => {
        const pageNum = idx + 1;
        html += \`
          <button class="nav-item \${activePageIndex === pageNum ? 'active' : ''}" onclick="selectPage(\${pageNum})">
            <span>\${pageNum}.</span>
            <span style="truncate">\${p.title}</span>
          </button>
        \`;
      });

      navList.innerHTML = html;
    }

    function selectPage(idx) {
      activePageIndex = idx;
      renderNav();
      renderPage(idx);
    }

    function renderPage(idx) {
      const container = document.getElementById('page-content');

      if (idx === 0) {
        // COVER PAGE
        container.innerHTML = \`
          <div style="height: 100%; display: flex; flex-direction: column; justify-content: space-between; text-align: center; border: 4px double #000; padding: 40px;">
            <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #059669;">
              \${PROJECT_DATA.targetAgeGroup} • \${PROJECT_DATA.subject.toUpperCase()}
            </div>

            <div style="margin: auto 0;">
              <h1 style="font-size: 32px; font-family: Georgia, serif; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 12px;">
                \${PROJECT_DATA.title}
              </h1>
              <p style="font-size: 15px; font-style: italic; color: #475569;">
                \${PROJECT_DATA.subtitle}
              </p>
            </div>

            <div style="border: 2px dashed #000; padding: 20px; text-align: left; max-width: 400px; margin: 0 auto; font-size: 13px; line-height: 1.8;">
              <div><strong>Student Name:</strong> <input type="text" style="border:none; border-bottom: 1px solid #000; width: 65%; font-weight: bold;" placeholder="Enter name"></div>
              <div><strong>Grade / Class:</strong> <input type="text" style="border:none; border-bottom: 1px solid #000; width: 65%; font-weight: bold;" placeholder="Enter grade"></div>
              <div><strong>School:</strong> <input type="text" style="border:none; border-bottom: 1px solid #000; width: 75%; font-weight: bold;" placeholder="School name"></div>
            </div>

            <div style="font-size: 11px; color: #64748b; margin-top: 24px;">
              Published by: \${PROJECT_DATA.author} • Offline Interactive Workbook Edition
            </div>
          </div>
        \`;
        return;
      }

      const page = PROJECT_DATA.pages[idx - 1];
      let bodyHtml = '';

      if (page.type === 'data_sheet_table' && page.tableData) {
        const t = page.tableData;
        bodyHtml = \`
          <div style="margin-bottom: 16px;">
            <h4 style="margin: 0 0 8px 0; text-transform: uppercase;">\${t.title || 'Data Sheet'}</h4>
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                  <tr style="background: #f1f5f9;">
                    \${t.headers.map(h => \`<th style="border: 1px solid #000; padding: 8px; text-align: left;">\${h}</th>\`).join('')}
                  </tr>
                </thead>
                <tbody>
                  \${t.rows.map(row => \`
                    <tr>
                      \${row.map(cell => \`<td style="border: 1px solid #000; padding: 6px;"><input type="text" value="\${cell}" style="width: 100%; border: none; font-size: 13px;" /></td>\`).join('')}
                    </tr>
                  \`).join('')}
                </tbody>
              </table>
            </div>
          </div>
        \`;
      } else if (page.type === 'graph_chart' && page.chartData) {
        const c = page.chartData;
        const chartItems = c.items || (c.labels || []).map((l, i) => ({
          label: l,
          value: c.dataPoints?.[i] ?? 0,
          color: c.color
        }));
        const maxVal = Math.max(...chartItems.map(i => i.value), 10);
        bodyHtml = \`
          <div style="border: 1px solid #000; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <h4 style="margin: 0 0 12px 0; text-align: center; text-transform: uppercase;">\${c.title} (\${c.type.toUpperCase()})</h4>
            <div style="display: flex; align-items: flex-end; justify-content: space-around; height: 180px; border-left: 2px solid #000; border-bottom: 2px solid #000; padding: 10px 20px 0 20px;">
              \${chartItems.map(item => {
                const heightPct = Math.round((item.value / maxVal) * 100);
                return \`
                  <div style="display: flex; flex-direction: column; align-items: center; width: 40px; gap: 4px;">
                    <span style="font-size: 11px; font-weight: bold;">\${item.value}</span>
                    <div style="width: 100%; height: \${heightPct}%; background: \${item.color || '#10b981'}; border-radius: 4px 4px 0 0;"></div>
                    <span style="font-size: 11px; font-weight: bold; text-align: center;">\${item.label}</span>
                  </div>
                \`;
              }).join('')}
            </div>
          </div>
        \`;
      } else if (page.type === 'folktale_story' && page.folktaleData) {
        const f = page.folktaleData;
        bodyHtml = \`
          <div style="border: 1px solid #000; padding: 16px; border-radius: 8px; background: #fafafa; margin-bottom: 16px; line-height: 1.6;">
            <h3 style="margin: 0 0 8px 0; font-size: 18px;">\${f.title}</h3>
            <p style="margin: 0;">\${f.storyText}</p>
          </div>
          <div style="background: #ecfdf5; border: 1px solid #10b981; padding: 12px; border-radius: 6px; margin-bottom: 16px; font-size: 13px;">
            <strong>Moral Lesson (Hunhu / Ubuntu):</strong> \${f.moralLesson}
          </div>
          <div style="font-size: 14px;">
            <strong>Comprehension Questions:</strong>
            \${f.comprehensionQuestions.map((q, qIdx) => \`
              <div style="margin-top: 12px;">
                <div>\${qIdx + 1}. \${q.question}</div>
                <textarea style="width: 100%; height: 50px; margin-top: 4px; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;" placeholder="Write your answer..."></textarea>
              </div>
            \`).join('')}
          </div>
        \`;
      } else if (page.type === 'community_project' && page.communityProjectData) {
        const p = page.communityProjectData;
        bodyHtml = \`
          <div style="border: 2px solid #000; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <h3 style="margin: 0 0 6px 0;">\${p.projectName}</h3>
            <div style="font-size: 12px; font-weight: bold; color: #475569;">ZIMSEC Syllabus Code: \${p.zimsecSyllabusCode}</div>
            <p style="margin-top: 8px; font-size: 13px;"><strong>Objectives:</strong> \${p.objectives.join(', ')}</p>
            <p style="margin-top: 4px; font-size: 13px;"><strong>Required Materials:</strong> \${p.requiredMaterials.join(', ')}</p>
          </div>
          <div style="font-size: 13px; margin-bottom: 16px;">
            <strong>Field Instructions:</strong>
            <ol style="padding-left: 20px; line-height: 1.6;">
              \${p.fieldSteps.map(s => \`<li>\${s}</li>\`).join('')}
            </ol>
          </div>
        \`;
      } else if (page.type === 'language_translation' && page.languageData) {
        const l = page.languageData;
        bodyHtml = \`
          <div style="border: 1px solid #000; padding: 14px; border-radius: 6px; background: #fafafa; margin-bottom: 16px;">
            <h4 style="margin: 0 0 6px 0; text-transform: uppercase;">\${l.language} Language Exercise (\${l.topicType})</h4>
            <p style="margin: 0; font-style: italic;">\${l.passageText || ''}</p>
          </div>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            \${l.exercises.map((ex, exIdx) => \`
              <div style="border: 1px solid #cbd5e1; padding: 12px; border-radius: 6px; font-size: 14px;">
                <strong>\${exIdx + 1}. \${ex.prompt}</strong>
                <input type="text" style="width: 100%; padding: 6px; margin-top: 6px; border: 1px solid #94a3b8; border-radius: 4px;" placeholder="Your answer...">
              </div>
            \`).join('')}
          </div>
        \`;
      } else if (page.type === 'math_worksheet') {
        bodyHtml = \`
          <div class="math-grid-offline">
            \${(page.mathProblems || []).map((prob, pIdx) => {
              const katexHtml = prob.renderedMath || prob.expression;
              return \`
                <div class="math-card-offline">
                  <div style="font-size: 12px; font-weight: bold; color: #64748b;">Problem #\${pIdx + 1}</div>
                  <div style="margin: 12px 0; text-align: center;">\${katexHtml}</div>
                  <input type="text" placeholder="Your Answer (e.g. \${prob.answer})" />
                </div>
              \`;
            }).join('')}
          </div>
        \`;
      } else if (page.type === 'coloring_lineart') {
        const elements = page.coloringElements || [];
        bodyHtml = \`
          <div class="color-palette">
            \${['#000000', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#ffffff'].map(c => \`
              <div class="swatch" style="background: \${c};" onclick="selectColor('\${c}')"></div>
            \`).join('')}
          </div>
          <div style="text-align: center; margin-top: 12px;">
            <svg width="550" height="380" viewBox="0 0 550 420" style="border: 2px solid #000; border-radius: 8px; background: #fff;" id="coloring-svg">
              \${elements.map(el => {
                if (el.type === 'circle') {
                  return \`<circle cx="\${el.cx}" cy="\${el.cy}" r="\${el.r}" stroke="\${el.strokeColor || '#000'}" stroke-width="\${el.strokeWidth || 2}" fill="\${el.fillColor || '#fff'}" onclick="colorShape(this)" />\`;
                } else if (el.type === 'rect') {
                  return \`<rect x="\${el.x}" y="\${el.y}" width="\${el.width}" height="\${el.height}" stroke="\${el.strokeColor || '#000'}" stroke-width="\${el.strokeWidth || 2}" fill="\${el.fillColor || '#fff'}" onclick="colorShape(this)" />\`;
                } else {
                  return \`<path d="\${el.d}" stroke="\${el.strokeColor || '#000'}" stroke-width="\${el.strokeWidth || 2}" fill="\${el.fillColor || 'none'}" onclick="colorShape(this)" />\`;
                }
              }).join('')}
            </svg>
          </div>
        \`;
      } else if (page.type === 'past_exam_paper' && page.pastExamData) {
        const exam = page.pastExamData;
        bodyHtml = \`
          <div style="border: 2px solid #000; padding: 16px; border-radius: 6px; background: #fff; color: #000; margin-bottom: 16px;">
            <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px;">
              <div style="font-size: 13px; font-weight: bold; text-transform: uppercase;">ZIMBABWE SCHOOL EXAMINATIONS COUNCIL</div>
              <div style="font-size: 11px; font-weight: bold;">\${exam.examSession}</div>
              <div style="font-size: 14px; font-weight: 900; margin-top: 4px;">\${exam.subjectCode}</div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 6px; margin-bottom: 12px;">
              <span>TIME ALLOWED: \${exam.timeAllowed}</span>
              <span>TOTAL: \${exam.totalMarks} MARKS</span>
            </div>
            <div style="font-size: 12px; background: #f8fafc; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; margin-bottom: 12px;">
              <strong>INSTRUCTIONS TO CANDIDATES:</strong>
              <ul style="margin: 4px 0 0 16px; padding: 0;">
                \${exam.instructionsToCandidates.map(i => \`<li>\${i}</li>\`).join('')}
              </ul>
            </div>
            \${exam.sections.map(sec => \`
              <div style="margin-top: 14px; border-top: 1.5px solid #000; padding-top: 8px;">
                <h4 style="margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; background: #e2e8f0; padding: 4px 8px;">\${sec.sectionName}</h4>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                  \${sec.questions.map(q => \`
                    <div style="padding: 10px; border: 1px solid #e2e8f0; border-radius: 4px;">
                      <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 13px;">
                        <span>Question \${q.questionNumber}:</span>
                        <span style="color: #059669;">[\${q.marks} Mark\${q.marks > 1 ? 's' : ''}]</span>
                      </div>
                      <div style="font-size: 13px; margin: 4px 0;">\${q.questionText}</div>
                      \${q.options ? \`
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 6px; font-size: 12px;">
                          \${q.options.map(opt => \`<div style="padding: 4px; background: #f1f5f9; border-radius: 4px;">\${opt}</div>\`).join('')}
                        </div>
                      \` : ''}
                      <textarea style="width: 100%; height: \${q.marks * 20 + 20}px; margin-top: 8px; padding: 6px; font-size: 12px; border: 1px solid #cbd5e1; border-radius: 4px;" placeholder="Write your answer here..."></textarea>
                    </div>
                  \`).join('')}
                </div>
              </div>
            \`).join('')}
          </div>
        \`;
      } else if (page.type === 'revision_test' && page.revisionTestData) {
        const rev = page.revisionTestData;
        bodyHtml = \`
          <div style="border: 2px solid #2563eb; padding: 16px; border-radius: 6px; background: #fff; color: #000; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 8px; margin-bottom: 12px;">
              <div>
                <h3 style="margin: 0; font-size: 16px; color: #1e40af;">\${rev.testTitle}</h3>
                <div style="font-size: 12px; color: #475569;">Topic: <strong>\${rev.syllabusTopic}</strong></div>
              </div>
              <div style="text-align: right; background: #eff6ff; padding: 6px 12px; border-radius: 4px; border: 1px solid #2563eb;">
                <div style="font-size: 11px; font-weight: bold; color: #1e40af;">Time: \${rev.timeLimitMinutes} Mins</div>
                <div style="font-size: 12px; font-weight: bold; color: #059669;">Total: \${rev.totalPoints} Marks</div>
              </div>
            </div>
            <div style="font-size: 12px; background: #f8fafc; padding: 8px; border-radius: 4px; margin-bottom: 12px; border: 1px solid #e2e8f0;">
              <strong>Instructions:</strong> \${rev.instructions}
            </div>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              \${rev.questions.map(q => \`
                <div style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px;">
                  <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 13px;">
                    <span style="color: #1e3a8a;">Question \${q.questionNum}:</span>
                    <span style="color: #059669;">[\${q.maxPoints} Points]</span>
                  </div>
                  <div style="font-size: 13px; margin: 4px 0 8px 0;">\${q.question}</div>
                  <textarea style="width: 100%; height: \${(q.answerSpaceLines || 3) * 24}px; padding: 6px; font-size: 12px; border: 1px solid #cbd5e1; border-radius: 4px;" placeholder="Write answer here..."></textarea>
                </div>
              \`).join('')}
            </div>
          </div>
        \`;
      } else if (page.type === 'cad_drafting' && page.cadDraftingData) {
        const cad = page.cadDraftingData;
        bodyHtml = \`
          <div style="border: 2px solid #000; padding: 16px; border-radius: 6px; background: #fff; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px;">
              <div>
                <span style="font-size: 11px; font-weight: 800; color: #0284c7; text-transform: uppercase;">\${cad.software}</span>
                <h3 style="margin: 2px 0 0 0; font-size: 16px;">\${cad.title}</h3>
              </div>
              <div style="font-family: monospace; font-size: 11px; text-align: right;">
                <div>Scale: <strong>\${cad.scale}</strong></div>
                <div>Units: <strong>\${cad.projectUnits}</strong></div>
              </div>
            </div>
            <div style="border: 2px solid #0f172a; background: #020617; color: #f8fafc; padding: 16px; border-radius: 6px; text-align: center; margin-bottom: 12px;">
              <div style="font-family: monospace; font-size: 12px; color: #38bdf8; font-weight: bold; margin-bottom: 8px;">
                [\${cad.software} VECTOR BLUEPRINT SCHEMA • DRAWING KEY: \${cad.blueprintSvgKey.toUpperCase()}]
              </div>
              <div style="border: 1px dashed #38bdf8; padding: 20px; border-radius: 4px; font-family: monospace; font-size: 11px; line-height: 1.6; color: #cbd5e1;">
                \${cad.dimensions.map(d => \`<div>\${d.label}: <strong>\${d.value}</strong></div>\`).join('')}
              </div>
            </div>
            <div style="font-size: 13px; font-weight: bold; margin-bottom: 8px;">Exercise Tasks:</div>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              \${cad.exerciseTasks.map(t => \`
                <div style="border: 1px solid #cbd5e1; padding: 10px; border-radius: 4px;">
                  <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 12px;">
                    <span>Task #\${t.taskNumber}:</span>
                    <span style="color: #059669;">[\${t.maxPoints} Points]</span>
                  </div>
                  <div style="font-size: 12px; margin: 4px 0 8px 0;">\${t.instruction}</div>
                  <textarea style="width: 100%; height: 50px; padding: 6px; font-size: 12px; border: 1px solid #94a3b8; border-radius: 4px;" placeholder="Write response or calculation..."></textarea>
                </div>
              \`).join('')}
            </div>
          </div>
        \`;
      } else if (page.type === 'three_d_printing' && page.threeDPrintingData) {
        const pr = page.threeDPrintingData;
        bodyHtml = \`
          <div style="border: 2px solid #10b981; padding: 16px; border-radius: 6px; background: #fff; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #10b981; padding-bottom: 8px; margin-bottom: 12px;">
              <div>
                <span style="font-size: 11px; font-weight: 800; color: #047857; text-transform: uppercase;">\${pr.printerTechnology} • Filament: \${pr.filamentType}</span>
                <h3 style="margin: 2px 0 0 0; font-size: 16px;">3D Printing Dynamics (\${pr.topic.replace(/_/g, ' ').toUpperCase()})</h3>
              </div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; font-size: 11px; margin-bottom: 12px;">
              <div style="border: 1px solid #cbd5e1; padding: 6px; border-radius: 4px; background: #f8fafc;">
                <div style="color: #64748b; font-size: 9px; font-weight: bold;">LAYER HEIGHT</div>
                <div style="font-family: monospace; font-weight: bold;">\${pr.slicerSettings.layerHeightMm} mm</div>
              </div>
              <div style="border: 1px solid #cbd5e1; padding: 6px; border-radius: 4px; background: #f8fafc;">
                <div style="color: #64748b; font-size: 9px; font-weight: bold;">HOTEND / BED</div>
                <div style="font-family: monospace; font-weight: bold;">\${pr.slicerSettings.nozzleTempC}°C / \${pr.slicerSettings.bedTempC}°C</div>
              </div>
              <div style="border: 1px solid #cbd5e1; padding: 6px; border-radius: 4px; background: #f8fafc;">
                <div style="color: #64748b; font-size: 9px; font-weight: bold;">SPEED</div>
                <div style="font-family: monospace; font-weight: bold;">\${pr.slicerSettings.printSpeedMmS} mm/s</div>
              </div>
              <div style="border: 1px solid #cbd5e1; padding: 6px; border-radius: 4px; background: #f8fafc;">
                <div style="color: #64748b; font-size: 9px; font-weight: bold;">INFILL</div>
                <div style="font-family: monospace; font-weight: bold; color: #059669;">\${pr.slicerSettings.infillDensityPercent}% \${pr.slicerSettings.infillPattern}</div>
              </div>
            </div>
            <div style="font-size: 13px; font-weight: bold; margin-bottom: 8px;">Additive Manufacturing Questions:</div>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              \${pr.exerciseQuestions.map(q => \`
                <div style="border: 1px solid #cbd5e1; padding: 10px; border-radius: 4px;">
                  <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 12px;">
                    <span>Question #\${q.questionNum}:</span>
                    <span style="color: #059669;">[\${q.points} Points]</span>
                  </div>
                  <div style="font-size: 12px; margin: 4px 0 8px 0;">\${q.question}</div>
                  <textarea style="width: 100%; height: 50px; padding: 6px; font-size: 12px; border: 1px solid #94a3b8; border-radius: 4px;" placeholder="Write answer..."></textarea>
                </div>
              \`).join('')}
            </div>
          </div>
        \`;
      } else if (page.quizQuestions && page.quizQuestions.length > 0) {
        const qList = page.quizQuestions;
        bodyHtml = \`
          <div style="border: 2px solid #ea580c; padding: 16px; border-radius: 6px; background: #fff; margin-bottom: 16px;">
            <div style="font-weight: 800; font-size: 14px; color: #ea580c; text-transform: uppercase; border-bottom: 2px solid #ea580c; padding-bottom: 6px; margin-bottom: 12px; display: flex; justify-content: space-between;">
              <span>Assessment & Quiz Items (\${qList.length} Questions)</span>
              <span>Total Marks: \${qList.reduce((acc, q) => acc + (q.points || 5), 0)}</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              \${qList.map((q, idx) => \`
                <div style="padding: 10px; border: 1.5px solid #1e293b; border-radius: 6px; background: #fafafa;">
                  <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 13px;">
                    <span>Question \${idx + 1}. \${q.question}</span>
                    <span style="color: #ea580c;">[\${q.points || 5} Marks]</span>
                  </div>
                  \${(q.type === 'multiple_choice' || q.type === 'true_false' || !q.type) ? \`
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px; font-size: 12px;">
                      \${q.options.map((opt, oIdx) => \`
                        <div style="padding: 6px; border: 1px solid #cbd5e1; border-radius: 4px; background: #fff; font-weight: 500;">
                          <strong>\${String.fromCharCode(65 + oIdx)})</strong> \${opt}
                        </div>
                      \`).join('')}
                    </div>
                  \` : \`
                    <textarea style="width: 100%; height: 50px; margin-top: 8px; padding: 6px; font-size: 12px; border: 1px solid #cbd5e1; border-radius: 4px;" placeholder="Write your response..."></textarea>
                  \`}
                </div>
              \`).join('')}
            </div>
          </div>
        \`;
      } else {
        bodyHtml = \`<div style="font-size: 14px;">Standard activity content for \${page.title}</div>\`;
      }

      container.innerHTML = \`
        <div>
          <div class="paper-header">
            <h2>\${page.title}</h2>
            <div style="font-size: 12px; font-weight: bold;">
              Page \${page.pageNumber} of \${PROJECT_DATA.pages.length}
            </div>
          </div>

          <div class="paper-instructions">
            <strong>Task:</strong> \${page.instructions}
          </div>

          \${bodyHtml}
        </div>

        <div class="footer-note">
          <span>\${PROJECT_DATA.title}</span>
          <span>ZIMSEC & Academic Offline Shell</span>
        </div>
      \`;
    }

    function selectColor(color) {
      activeColor = color;
    }

    function colorShape(element) {
      element.setAttribute('fill', activeColor);
    }

    function toggleAnswerKey() {
      alert("Teacher Answer Keys:\\n\\n" + PROJECT_DATA.pages.map(p => {
        if (!p.mathProblems) return p.title + ": See Curriculum Guide";
        return p.title + "\\n" + p.mathProblems.map((m, i) => \`  #\${i+1}: \${m.answer}\`).join("\\n");
      }).join("\\n\\n"));
    }

    window.onload = initShell;
  </script>
</body>
</html>`;
}

/**
 * Downloads the project as a self-contained offline single-file HTML shell.
 */
export function downloadOfflineShellHtml(project: EducationalBookProject): void {
  const htmlContent = exportEducationalBookToOfflineShellHtml(project);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = (project.title || 'zimsec_workbook')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_') + '_offline_app_shell.html';
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
